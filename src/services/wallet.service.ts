import ms from "ms";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { isValidObjectId } from "mongoose";

import { BCRYPT_SALT } from "../config";
import MailService from "./mail.service";
import StripeUtil from "../utils/stripe";
import Token from "../models/token.model";
import Wallet from "../models/wallet.model";
import useTransaction from "../utils/use-transaction";
import CustomError from "../utils/graphql/custom-error";

import type { ClientSession } from "mongoose";

class WalletService {
    async create(userId: string, session?: ClientSession) {
        const existingWallet = await Wallet.findOne({ userId });
        if (existingWallet) throw new CustomError("User already has a wallet");

        return await new Wallet({ userId }).save({ session });
    }

    async getByUserId(userId: string) {
        if (!isValidObjectId(userId)) throw new CustomError("Invalid userId");

        const wallet = await Wallet.findOne({ userId });
        if (!wallet) throw new CustomError("Wallet not found");

        return wallet;
    }

    async getOne(walletId: string) {
        if (!isValidObjectId(walletId)) throw new CustomError("Invalid walletId");

        const wallet = await Wallet.findOne({ _id: walletId });
        if (!wallet) throw new CustomError("Wallet not found");

        return wallet;
    }

    async getAll(pagination: PaginationInput) {
        /* Note:
         * - if sorting in ascending order (1) then use $gt
         * - if sorting in descending order (-1) then use $lt
         */
        const { limit = 5, next } = pagination;
        let query = {};

        const total = await Wallet.countDocuments(query);

        if (next) {
            const [nextId, nextCreatedAt] = next.split("_");
            query = {
                ...query,
                $or: [{ createdAt: { $gt: nextCreatedAt } }, { createdAt: nextCreatedAt, _id: { $gt: nextId } }]
            };
        }

        const wallets = await Wallet.find(query)
            .sort({ createdAt: 1, _id: 1 })
            .limit(Number(limit) + 1);

        const hasNext = wallets.length > limit;
        if (hasNext) wallets.pop(); // Remove the extra user from the array

        const nextCursor = hasNext ? `${wallets[wallets.length - 1]._id}_${wallets[wallets.length - 1].createdAt.getTime()}` : null;

        return {
            wallets,
            pagination: {
                total,
                hasNext,
                next: nextCursor
            }
        };
    }

    async initializeDeposit(userId: string, amount: number, currencyCode: string, cardId?: string) {
        const { default: UserService } = await import("./user.service");
        const { default: CurrencyService } = await import("./currency.service");
        const { default: NotificationService } = await import("./notification.service");

        const user = await UserService.getOne(userId);
        const wallet = await this.getByUserId(userId);

        if (!amount) throw new CustomError("amount is required");
        if (!Number.isInteger(amount)) throw new CustomError("Amount must be an integer");
        if (amount < 10) throw new CustomError("Minimum amount is 10");

        if (!currencyCode) throw new CustomError("currency is required");
        if (currencyCode !== "USD") throw new CustomError("Only USD is supported for now");

        const currency = await CurrencyService.getByCode(currencyCode);

        const purchaseData = {
            amount,
            walletId: wallet.id,
            currency: currency.code,
            price: amount * currency.gildRate * (currency.isZeroDecimal ? 1 : 100),
            user: {
                email: user.email,
                name: `${user.name}`
            }
        };

        const intent = await StripeUtil.purchaseGild(purchaseData, cardId);

        await NotificationService.create({
            sourceId: "system",
            receiverId: user.id,
            title: "Deposit Initiated",
            message: `You have initiated a deposit of ${amount} GILD to your Gild wallet`
        });

        return intent.client_secret as string;
    }

    async completeDeposit(metadata: DepositMetadata, stripePaymentId: string) {
        const { default: TransactionService } = await import("./transaction.service");
        const { default: NotificationService } = await import("./notification.service");

        const price = parseInt(metadata.price);
        const amount = parseInt(metadata.amount);

        const wallet = await this.getOne(metadata.wallet_id);

        await useTransaction(async (session: ClientSession) => {
            await Wallet.findOneAndUpdate({ _id: metadata.wallet_id }, { $inc: { balance: amount } }, { session });

            await NotificationService.create(
                {
                    sourceId: "system",
                    receiverId: wallet.userId,
                    title: "Deposit Completed",
                    message: `You have successfully deposited ${amount} GILD to your Gild wallet`
                },
                session
            );

            await TransactionService.recordDeposit(
                { walletId: metadata.wallet_id, userId: wallet.userId, currency: metadata.currency, amount, price, stripePaymentId },
                session
            );
        });
    }

    /**
     *
     * @param senderId Sender ID
     * @param receiverId Receiver ID, email or username
     * @param amount Amount to transfer
     * @returns Boolean
     */
    async initializeTransfer(senderId: string, receiverId: string, amount: number) {
        const { default: UserService } = await import("./user.service");
        const { default: TransactionService } = await import("./transaction.service");
        const { default: NotificationService } = await import("./notification.service");

        const sender = await UserService.getOne(senderId);
        const receiver = await UserService.getUserById(receiverId);

        const senderWallet = await this.getByUserId(sender.id);

        if (sender.id === receiver.id) throw new CustomError("invalid transfer");
        if (senderWallet.balance < amount) throw new CustomError("insufficient funds");

        const last24Hours = await TransactionService.transferInLast24Hours(sender.id);
        if (last24Hours.count >= 3) throw new CustomError("you have reached the maximum number of transfers per day");
        if (last24Hours.totalAmount + amount > 1000) throw new CustomError("you have reached the maximum amount of transfers per day");

        if (!amount) throw new CustomError("amount is required");
        if (!Number.isInteger(amount)) throw new CustomError("amount must be an integer");
        if (amount < 10) throw new CustomError("minimum transfer is 10 Gild tokens per transaction");
        if (amount > 250) throw new CustomError("maximum transfer is 250 Gild tokens per transaction");

        const token = await Token.findOne({ userId: sender.id, type: "transfer_gild" });
        if (token) await token.deleteOne();

        const nanoidOTP = customAlphabet("012345789", 6);
        const OTP = nanoidOTP();

        const hashedOTP = await bcrypt.hash(OTP, BCRYPT_SALT);

        await new Token({
            token: hashedOTP,
            userId: sender.id,
            type: "transfer_gild",
            expiresAt: Date.now() + ms("15m"),
            gildTransfer: { amount, receiverId: receiver.id }
        }).save();

        await new MailService(sender).sendTransferOTP(OTP);

        await NotificationService.create({
            title: "Transfer Notification",
            message: `A transfer of ${amount} GILD to ${receiver.name} has been initiated`,
            sourceId: "system",
            receiverId: sender.id
        });

        return true;
    }

    /**
     *
     * @param senderId Sender ID
     * @param receiverId Receiver ID, email or username
     * @param amount Amount to transfer
     * @returns Boolean
     */
    async resendTransferOTP(senderId: string, receiverId: string, amount: number) {
        const { default: UserService } = await import("./user.service");

        const receiver = await UserService.getUserById(receiverId);

        const token = await Token.findOne({
            userId: senderId,
            type: "transfer_gild",
            "gildTransfer.amount": amount,
            "gildTransfer.receiverId": receiver.id
        });

        if (!token) throw new CustomError("invalid transfer");
        if (token.expiresAt.getTime() - Date.now() > ms("10m")) throw new CustomError("Wait 5 minutes before resending OTP");

        await token.deleteOne();

        const nanoidOTP = customAlphabet("012345789", 6);
        const OTP = nanoidOTP();
        const hashedOTP = await bcrypt.hash(OTP, BCRYPT_SALT);

        await new Token({
            token: hashedOTP,
            userId: senderId,
            type: "transfer_gild",
            expiresAt: Date.now() + ms("15m"),
            gildTransfer: { amount, receiverId: receiver.id }
        }).save();

        const sender = await UserService.getOne(senderId);

        await new MailService(sender).sendTransferOTP(OTP);

        return true;
    }

    async completeTransfer(senderId: string, data: GildTransferInput) {
        const { default: UserService } = await import("./user.service");
        const { default: TransactionService } = await import("./transaction.service");
        const { default: NotificationService } = await import("./notification.service");

        if (!data.OTP) throw new CustomError("OTP is required");
        if (!data.amount) throw new CustomError("amount is required");
        if (!data.receiverId) throw new CustomError("receiverId is required");

        const sender = await UserService.getOne(senderId);
        const senderWallet = await this.getByUserId(senderId);

        const receiver = await UserService.getUserById(data.receiverId);
        const receiverWallet = await this.getByUserId(receiver.id);

        const token = await Token.findOne({
            userId: senderId,
            type: "transfer_gild",
            "gildTransfer.amount": data.amount,
            "gildTransfer.receiverId": receiver.id
        });
        if (!token) throw new CustomError("invalid OTP");

        const isOTPValid = await bcrypt.compare(data.OTP, token.token);
        if (!isOTPValid) throw new CustomError("invalid OTP");

        if (senderWallet.balance < data.amount) throw new CustomError("insufficient funds");

        const last24Hours = await TransactionService.transferInLast24Hours(senderId);
        if (last24Hours.count >= 3) throw new CustomError("you have reached the maximum number of transfers per day");
        if (last24Hours.totalAmount + data.amount > 1000) throw new CustomError("you have reached the maximum amount of transfers per day");

        await useTransaction(async (session: ClientSession) => {
            await Wallet.findOneAndUpdate({ _id: senderWallet.id }, { balance: senderWallet.balance - data.amount }, { session });
            await Wallet.findOneAndUpdate({ _id: receiverWallet.id }, { balance: receiverWallet.balance + data.amount }, { session });

            await token.deleteOne({ session });
            await TransactionService.recordTransfer({ senderId, receiverId: receiver.id, amount: data.amount }, session);
        });

        await NotificationService.create({
            title: "Transfer Notification",
            message: `A transfer of ${data.amount} GILD to ${receiver.name} has been completed`,
            sourceId: "system",
            receiverId: sender.id
        });

        await NotificationService.create({
            title: "Transfer Notification",
            message: `You have received a transfer of ${data.amount} GILD from ${sender.name}`,
            sourceId: sender.id,
            receiverId: receiver.id
        });

        return true;
    }

    async initializeWithdrawal(userId: string, amount: number) {
        const { default: UserService } = await import("./user.service");
        const { default: StripeService } = await import("./stripe.service");
        const { default: NotificationService } = await import("./notification.service");

        if (!amount) throw new CustomError("amount is required");
        if (!Number.isInteger(amount)) throw new CustomError("Amount must be an integer");
        if (amount < 50) throw new CustomError("Minimum amount is 50");

        const wallet = await this.getByUserId(userId);
        if (wallet.balance < amount) throw new CustomError("insufficient funds");

        const user = await UserService.getOne(userId);
        if (!user.stripeAccountId) throw new CustomError("you have not setup a stripe connect account");

        const stripeAccountStatus = await StripeService.getAccountStatus(user.stripeAccountId);
        if (stripeAccountStatus !== "connected") throw new CustomError("setup your stripe connect account to withdraw");

        // Delete any existing withdrawal token
        const token = await Token.findOne({ userId, type: "withdraw_gild" });
        if (token) await token.deleteOne();

        const nanoidOTP = customAlphabet("012345789", 6);
        const OTP = nanoidOTP();
        const hashedOTP = await bcrypt.hash(OTP, BCRYPT_SALT);

        await new Token({
            userId,
            token: hashedOTP,
            type: "withdraw_gild",
            expiresAt: Date.now() + ms("15m"),
            gildWithdrawal: { amount, walletId: wallet.id }
        }).save();

        await new MailService(user).sendWithdrawalOTP(OTP);

        await NotificationService.create({
            sourceId: "system",
            receiverId: user.id,
            title: "Withdrawal Initiated",
            message: `You have initiated a withdrawal of ${amount} GILD from your Gild wallet`
        });

        return true;
    }

    async resendWithdrawalOTP(userId: string, amount: number) {
        const { default: UserService } = await import("./user.service");

        const wallet = await this.getByUserId(userId);
        const user = await UserService.getOne(userId);

        const token = await Token.findOne({
            userId,
            type: "withdraw_gild",
            "gildWithdrawal.amount": amount,
            "gildWithdrawal.walletId": wallet.id
        });

        if (!token) throw new CustomError("invalid withdrawal");
        if (token.expiresAt.getTime() - Date.now() > ms("10m")) throw new CustomError("Wait 5 minutes before resending OTP");

        await token.deleteOne();

        const nanoidOTP = customAlphabet("012345789", 6);
        const OTP = nanoidOTP();
        const hashedOTP = await bcrypt.hash(OTP, BCRYPT_SALT);

        await new Token({
            userId,
            token: hashedOTP,
            type: "withdraw_gild",
            expiresAt: Date.now() + ms("15m"),
            gildWithdrawal: { amount, walletId: wallet.id }
        }).save();

        await new MailService(user).sendWithdrawalOTP(OTP);

        return true;
    }

    async completeWithdrawal(userId: string, data: GildWithdrawalInput) {
        const { default: UserService } = await import("./user.service");
        const { default: TransactionService } = await import("./transaction.service");
        const { default: NotificationService } = await import("./notification.service");

        if (!data.OTP) throw new CustomError("OTP is required");
        if (!data.amount) throw new CustomError("amount is required");

        const wallet = await this.getByUserId(userId);
        const user = await UserService.getOne(userId);

        const token = await Token.findOne({
            userId,
            type: "withdraw_gild",
            "gildWithdrawal.amount": data.amount,
            "gildWithdrawal.walletId": wallet.id
        });
        if (!token) throw new CustomError("invalid OTP");

        const isOTPValid = await bcrypt.compare(data.OTP, token.token);
        if (!isOTPValid) throw new CustomError("invalid OTP");

        if (wallet.balance < data.amount) throw new CustomError("insufficient funds");

        await useTransaction(async (session: ClientSession) => {
            await Wallet.findOneAndUpdate({ _id: wallet.id }, { balance: wallet.balance - data.amount }, { session });

            await NotificationService.create(
                {
                    sourceId: "system",
                    receiverId: user.id,
                    title: "Withdrawal Completed",
                    message: `You have successfully withdrawn ${data.amount} GILD from your Gild wallet`
                },
                session
            );

            await token.deleteOne({ session });
            await TransactionService.recordWithdrawal({ userId, amount: data.amount, walletId: wallet.id }, session);

            await StripeUtil.payout(user.stripeAccountId as string, data.amount, "Gild Wallet Withdrawal");
        });

        return true;
    }
}

export default new WalletService();
