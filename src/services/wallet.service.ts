import ms from "ms";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { isValidObjectId } from "mongoose";

import { BCRYPT_SALT } from "../config";
import MailService from "./mail.service";
import Token from "../models/token.model";
import Wallet from "../models/wallet.model";
import CustomError from "../utils/graphql/custom-error";
import useTransaction from "../utils/use-transaction";

import type { ClientSession } from "mongoose";

class WalletService {
    async create(userId: string) {
        const existingWallet = await Wallet.findOne({ userId });
        if (existingWallet) throw new CustomError("User already has a wallet");

        return await new Wallet({ userId }).save();
    }

    async getByUserId(userId: string) {
        if (!isValidObjectId(userId)) throw new CustomError("Invalid userId");

        const wallet = await Wallet.findOne({ userId });
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

    async initializeTransfer(senderId: string, receiverId: string, amount: number) {
        const { default: UserService } = await import("./user.service");
        const { default: NotificationService } = await import("./notification.service");

        const sender = await UserService.getOne(senderId);

        const token = await Token.findOne({ userId: senderId, type: "transfer_gild" });
        if (token) await token.deleteOne();

        const nanoidOTP = customAlphabet("012345789", 6);
        const OTP = nanoidOTP();

        const hashedOTP = await bcrypt.hash(OTP, BCRYPT_SALT);

        await new Token({
            token: hashedOTP,
            userId: senderId,
            type: "transfer_gild",
            expiresAt: Date.now() + ms("15m"),
            gildTransfer: { amount, receiverId }
        }).save();

        // await new MailService(sender).sendTransferOTP(OTP);
        console.log(`OTP: ${OTP}`);

        await NotificationService.create({
            title: "Hello world",
            message: "dummy notification dummy notification dummy notification",
            sourceId: "system",
            receiverId: sender.id
        });

        return true;
    }

    async completeTransfer(senderId: string, data: GildTransferInput) {
        const { default: TransactionService } = await import("./transaction.service");

        const senderWallet = await this.getByUserId(senderId);
        const receiverWallet = await this.getByUserId(data.receiverId);

        if (senderId === data.receiverId) throw new CustomError("invalid action");

        if (!data.OTP) throw new CustomError("OTP is required");
        if (!data.amount) throw new CustomError("amount is required");
        if (!Number.isInteger(data.amount)) throw new CustomError("amount must be an integer");
        if (data.amount < 10) throw new CustomError("minimum transfer is 10 Gild tokens per transaction");
        if (data.amount > 250) throw new CustomError("maximum transfer is 250 Gild tokens per transaction");

        const token = await Token.findOne({
            userId: senderId,
            type: "transfer_gild",
            "gildTransfer.amount": data.amount,
            "gildTransfer.receiverId": data.receiverId
        });
        if (!token) throw new CustomError("transfer cannot be completed");

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
            await TransactionService.recordTransfer({ senderId, receiverId: data.receiverId, amount: data.amount }, session);
        });

        return true;
    }
}

export default new WalletService();
