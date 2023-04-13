import { ROLE } from "../../../config";
import AuthService from "../../../services/auth.service";
import guard from "../../../middlewares/graphql/guard.middleware";

import type { Context } from "../../../types/graphql";
import type { IUser } from "../../../models/user.model";

export default {
    authLogin: async (_: any, { input }: AuthLoginArgs, __: Context): Promise<{ user: IUser; token: AuthToken }> => {
        return await AuthService.login(input);
    },
    authLoginWithGoogle: async (_: any, { token }: { token: string }, __: Context): Promise<{ user: IUser; token: AuthToken }> => {
        return await AuthService.loginWithGoogle(token);
    },
    authRegister: async (_: any, { input, businessData }: AuthRegisterArgs, __: Context): Promise<{ user: IUser; token: AuthToken }> => {
        return await AuthService.register(input, businessData);
    },
    authLogout: async (_: any, { refreshToken }: AuthLogoutArgs, __: Context): Promise<boolean> => {
        return await AuthService.logout({ refreshToken });
    },
    authVerifyEmail: async (_: any, { userId, verifyToken }: AuthVerifyEmailArgs, __: Context): Promise<boolean> => {
        return await AuthService.verifyEmail({ userId, verifyToken });
    },
    authRequestPasswordReset: async (_: any, { email }: AuthRequestPasswordResetArgs, __: Context): Promise<boolean> => {
        return await AuthService.requestPasswordReset(email);
    },
    authRefreshAccessToken: async (_: any, { refreshToken }: AuthRefreshAccessTokenArgs, __: Context): Promise<string> => {
        return await AuthService.refreshAccessToken({ refreshToken });
    },
    authUpdatePassword: async (_: any, { oldPassword, newPassword }: AuthUpdatePasswordArgs, context: Context): Promise<boolean> => {
        const user = guard(context.user, ROLE.USER);
        return await AuthService.updatePassword(user.id, { oldPassword, newPassword });
    },
    authRequestEmailVerification: async (_: any, { email }: AuthRequestEmailVerificationArgs, __: Context): Promise<boolean> => {
        return await AuthService.requestEmailVerification(email);
    },
    authResetPassword: async (_: any, { userId, resetToken, password }: AuthResetPasswordArgs, __: Context): Promise<boolean> => {
        return await AuthService.resetPassword({ userId, resetToken, password });
    }
};
