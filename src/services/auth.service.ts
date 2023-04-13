import ms from "ms";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import User from "./../models/user.model";
import Token from "./../models/token.model";
import MailService from "./../services/mail.service";
import useTransaction from "../utils/use-transaction";
import CustomError from "../utils/graphql/custom-error";
import { APP_NAME, JWT_SECRET, BCRYPT_SALT, URL, GOOGLE_CLIENT_ID } from "./../config";

import type { ClientSession } from "mongoose";

class AuthService {
    async register(data: RegisterInput, businessData?: BusinessCreateInput) {
        const { default: WalletService } = await import("./wallet.service");
        const { default: BusinessService } = await import("./business.service");

        if (!data.name) throw new CustomError("name is required");
        if (!data.email) throw new CustomError("email is required");
        if (!data.username) throw new CustomError("username is required");
        if (!data.password) throw new CustomError("password is required");

        if (data.username.toLowerCase() === APP_NAME) throw new CustomError("invalid username");
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(data.username)) throw new CustomError("invalid username");

        if (!data.role) throw new CustomError("role is required");
        if (!["user", "business"].includes(data.role)) throw new CustomError("invalid role");

        const existingEmail = await User.findOne({ email: data.email });
        if (existingEmail) throw new CustomError("email already exists");

        const existingUsername = await User.findOne({ username: data.username });
        if (existingUsername) throw new CustomError("username already exists");

        await useTransaction(async (session: ClientSession) => {
            const user = await new User(data).save({ session });

            if (data.role === "business") {
                if (!businessData) throw new CustomError("businessData is required");
                await BusinessService.create(businessData, user.id, session);
            }

            await WalletService.create(user.id, session);
        });

        const newUser = await User.findOne({ email: data.email });
        if (!newUser) throw new CustomError("An error occurred creating your account");

        await this.requestEmailVerification(newUser.email);

        const authTokens = await this.generateAuthTokens({ userId: newUser.id, role: newUser.role });

        return { user: newUser, token: authTokens };
    }

    async login(data: LoginInput) {
        const { default: NotificationService } = await import("./notification.service");

        if (!data.email) throw new CustomError("email is required");
        if (!data.password) throw new CustomError("password is required");

        // Check if user exist
        const user = await User.findOne({ email: data.email });
        if (!user) throw new CustomError("incorrect email or password");

        // Check if user password is correct
        const isCorrect = await bcrypt.compare(data.password, user.password);
        if (!isCorrect) throw new CustomError("incorrect email or password");

        const authTokens = await this.generateAuthTokens({ userId: user.id, role: user.role });

        await NotificationService.create({
            title: "Login Alert",
            message: "A new login was detected on your account",
            sourceId: "system",
            receiverId: user.id
        });

        return { user, token: authTokens };
    }

    async loginWithGoogle(token: string) {
        const { default: WalletService } = await import("./wallet.service");

        const client = new OAuth2Client(GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });

        const payload = ticket.getPayload();
        if (!payload) throw new CustomError("invalid token");

        let user = await User.findOne({ email: payload.email });
        if (!user) {
            await useTransaction(async (session: ClientSession) => {
                user = await new User({
                    role: "user",
                    isVerified: true,
                    name: payload.name,
                    email: payload.email,
                    password: payload.sub,
                    image: payload.picture,
                    username: payload.email ? payload.email.split("@")[0] : null
                }).save();

                await WalletService.create(user.id, session);
            });
        }
        if (!user) throw new CustomError("An error occurred creating your account");

        const authTokens = await this.generateAuthTokens({ userId: user.id, role: user.role });

        return { user, token: authTokens };
    }

    async generateAuthTokens(data: GenerateTokenInput) {
        const { userId, role } = data;

        const accessToken = JWT.sign({ id: userId, role }, JWT_SECRET, { expiresIn: "2h" });

        const refreshToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(refreshToken, BCRYPT_SALT);

        const refreshTokenJWT = JWT.sign({ userId, refreshToken }, JWT_SECRET, { expiresIn: "1d" });

        await new Token({
            userId,
            token: hash,
            type: "refresh_token",
            expiresAt: Date.now() + ms("1d")
        }).save();

        return { accessToken, refreshToken: refreshTokenJWT };
    }

    async refreshAccessToken(data: RefreshTokenInput) {
        const { refreshToken: refreshTokenJWT } = data;

        const decoded: any = JWT.verify(refreshTokenJWT, JWT_SECRET);
        const { userId, refreshToken } = decoded;

        const user = await User.findOne({ _id: userId });
        if (!user) throw new CustomError("User does not exist");

        const RTokens = await Token.find({ userId, type: "refresh_token" });
        if (RTokens.length === 0) throw new CustomError("invalid or expired refresh token");

        let tokenExists = false;

        for (const token of RTokens) {
            const isValid = await bcrypt.compare(refreshToken, token.token);

            if (isValid) {
                tokenExists = true;
                break;
            }
        }

        if (!tokenExists) throw new CustomError("invalid or expired refresh token");

        const accessToken = JWT.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "2h" });

        return accessToken;
    }

    async logout(data: LogoutInput) {
        const { refreshToken: refreshTokenJWT } = data;

        const decoded: any = JWT.verify(refreshTokenJWT, JWT_SECRET);
        const { refreshToken, userId } = decoded;

        const user = await User.findOne({ _id: userId });
        if (!user) throw new CustomError("User does not exist");

        const RTokens = await Token.find({ userId, type: "refresh_token" });
        if (RTokens.length === 0) throw new CustomError("invalid or expired refresh token");

        let tokenExists = false;

        for (const token of RTokens) {
            const isValid = await bcrypt.compare(refreshToken, token.token);

            if (isValid) {
                tokenExists = true;
                await token.deleteOne();

                break;
            }
        }

        if (!tokenExists) throw new CustomError("invalid or expired refresh token");

        return true;
    }

    async verifyEmail(data: VerifyEmailInput) {
        const { userId, verifyToken } = data;

        const user = await User.findOne({ _id: userId });
        if (!user) throw new CustomError("User does not exist");
        if (user.isVerified) throw new CustomError("email is already verified");

        const VToken = await Token.findOne({ userId, type: "verify_email" });
        if (!VToken) throw new CustomError("invalid or expired password reset token");

        const isValid = await bcrypt.compare(verifyToken, VToken.token);
        if (!isValid) throw new CustomError("invalid or expired password reset token");

        await User.updateOne({ _id: userId }, { $set: { isVerified: true } }, { new: true });

        await VToken.deleteOne();

        return true;
    }

    async requestEmailVerification(email: string) {
        const user = await User.findOne({ email });
        if (!user) throw new CustomError("email does not exist");
        if (user.isVerified) throw new CustomError("email is already verified");

        const token = await Token.findOne({ userId: user.id, type: "verify_email" });
        if (token) await token.deleteOne();

        const verifyToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(verifyToken, BCRYPT_SALT);

        await new Token({
            token: hash,
            userId: user.id,
            type: "verify_email",
            expiresAt: Date.now() + ms("1h")
        }).save();

        const link = `${URL.CLIENT_URL}/auth/email-verification?userId=${user.id}&verifyToken=${verifyToken}`;

        // Send Mail
        await new MailService(user).sendEmailVerificationMail(link);

        return true;
    }

    async requestPasswordReset(email: string) {
        const user = await User.findOne({ email });
        if (!user) throw new CustomError("email does not exist");

        const token = await Token.findOne({ userId: user.id, type: "reset_password" });
        if (token) await token.deleteOne();

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(resetToken, BCRYPT_SALT);

        await new Token({
            token: hash,
            userId: user.id,
            type: "reset_password",
            expiresAt: Date.now() + ms("1h")
        }).save();

        const link = `${URL.CLIENT_URL}/auth/password-reset?userId=${user.id}&resetToken=${resetToken}`;

        // Send Mail
        await new MailService(user).sendPasswordResetMail(link);

        return true;
    }

    async resetPassword(data: ResetPasswordInput) {
        const { default: NotificationService } = await import("./notification.service");

        const { userId, resetToken, password } = data;

        const user = await User.findOne({ _id: userId });
        if (!user) throw new CustomError("User does not exist");

        const RToken = await Token.findOne({ userId, type: "reset_password" });
        if (!RToken) throw new CustomError("invalid or expired password reset token");

        const isValid = await bcrypt.compare(resetToken, RToken.token);
        if (!isValid) throw new CustomError("invalid or expired password reset token");

        const isSame = await bcrypt.compare(password, user.password);
        if (isSame) throw new CustomError("you cannot use your current password");

        const hash = await bcrypt.hash(password, BCRYPT_SALT);

        await User.updateOne({ _id: userId }, { $set: { password: hash } }, { new: true });

        await RToken.deleteOne();

        await NotificationService.create({
            title: "Password Reset",
            message: "Your password has been reset, if you did not do this please contact support",
            sourceId: "system",
            receiverId: user.id
        });

        return true;
    }

    async updatePassword(userId: string, data: UpdatePasswordInput) {
        const { default: NotificationService } = await import("./notification.service");

        if (!data.oldPassword) throw new CustomError("password is required");
        if (!data.newPassword) throw new CustomError("new password is required");

        const user = await User.findOne({ _id: userId });
        if (!user) throw new CustomError("user dose not exist");

        // Check if user password is correct
        const isCorrect = await bcrypt.compare(data.oldPassword, user.password);
        if (!isCorrect) throw new CustomError("incorrect password");

        // Check if new password is same as old password
        if (data.oldPassword == data.newPassword) throw new CustomError("change password to something different");

        const hash = await bcrypt.hash(data.newPassword, BCRYPT_SALT);

        await User.updateOne({ _id: userId }, { $set: { password: hash } }, { new: true });

        await NotificationService.create({
            title: "Password Changed",
            message: "Your password has been changed, if you did not do this please contact support",
            sourceId: "system",
            receiverId: userId
        });

        return true;
    }
}

export default new AuthService();
