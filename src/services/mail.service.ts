import nodemailer from "nodemailer";

import { MAILER, APP_NAME } from "./../config";
import CustomError from "../utils/graphql/custom-error";
import { emailVerificationTemplate, resetPasswordTemplate, transferOTPTemplate, withdrawalOTPTemplate } from "./../email-templates";

import type { IUser } from "./../models/user.model";

class MailService {
    user: IUser;

    constructor(user: IUser) {
        this.user = user;
    }

    async send(subject: string, content: string, recipient: string) {
        if (!content) throw new CustomError("Content is required");
        if (!subject) throw new CustomError("Subject is required");
        if (!recipient || recipient.length < 1) throw new CustomError("Recipient is required");

        // Define nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: MAILER.HOST,
            port: MAILER.PORT,
            secure: MAILER.SECURE,
            auth: {
                user: MAILER.USER,
                pass: MAILER.PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        } as any);

        const result = await transporter.sendMail({
            subject,
            html: content,
            from: `${APP_NAME} <${MAILER.USER}>`,
            to: Array.isArray(recipient) ? recipient.join() : recipient
        });

        if (!result) throw new CustomError("Unable to send mail");

        return result;
    }

    async sendEmailVerificationMail(link: string) {
        const recipient = this.user.email;
        const subject = "Email Verification";
        const content = await emailVerificationTemplate(this.user.name, this.user.email, link);

        return await this.send(subject, content, recipient);
    }

    async sendPasswordResetMail(link: string) {
        const subject = "Reset password";
        const recipient = this.user.email;
        const content = await resetPasswordTemplate(this.user.name, this.user.email, link);

        return await this.send(subject, content, recipient);
    }

    async sendTransferOTP(otp: string) {
        const subject = "Transfer OTP";
        const recipient = this.user.email;
        const content = await transferOTPTemplate(this.user.name, this.user.email, otp);

        return await this.send(subject, content, recipient);
    }

    async sendWithdrawalOTP(otp: string) {
        const subject = "Withdrawal OTP";
        const recipient = this.user.email;
        const content = await withdrawalOTPTemplate(this.user.name, this.user.email, otp);

        return await this.send(subject, content, recipient);
    }
}

export default MailService;
