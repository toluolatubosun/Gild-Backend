import ms from "ms";

import Transaction from "../models/transaction.model";
import CustomError from "../utils/graphql/custom-error";

import type { ClientSession } from "mongoose";

class TransactionService {
    async recordTransfer(data: TransferRecordInput, session?: ClientSession) {
        if (!data.amount) throw new CustomError("amount not found");
        if (!data.senderId) throw new CustomError("senderId not found");
        if (!data.receiverId) throw new CustomError("receiverId not found");

        const transfer = await new Transaction({
            action: "transfer",
            transferInfo: {
                amount: data.amount,
                senderId: data.senderId,
                receiverId: data.receiverId
            }
        }).save({ session });

        return transfer;
    }

    async recordDeposit(data: DepositRecordInput, session?: ClientSession) {
        if (!data.price) throw new CustomError("price not found");
        if (!data.amount) throw new CustomError("amount not found");
        if (!data.userId) throw new CustomError("userId not found");
        if (!data.walletId) throw new CustomError("walletId not found");
        if (!data.currency) throw new CustomError("currency not found");
        if (!data.stripePaymentId) throw new CustomError("stripePaymentId not found");

        const deposit = await new Transaction({
            action: "deposit",
            depositInfo: {
                price: data.price,
                amount: data.amount,
                userId: data.userId,
                currency: data.currency,
                stripePaymentId: data.stripePaymentId
            }
        }).save({ session });

        return deposit;
    }

    async recordWithdrawal(data: WithdrawalRecordInput, session?: ClientSession) {
        if (!data.amount) throw new CustomError("amount not found");
        if (!data.userId) throw new CustomError("userId not found");
        if (!data.walletId) throw new CustomError("walletId not found");

        const withdrawal = await new Transaction({
            action: "withdrawal",
            withdrawalInfo: {
                amount: data.amount,
                userId: data.userId,
                walletId: data.walletId
            }
        }).save({ session });

        return withdrawal;
    }

    async transferInLast24Hours(userId: string) {
        const last24Hours = await Transaction.find({
            action: "transfer",
            "transferInfo.senderId": userId,
            createdAt: { $gte: new Date(new Date().getTime() - ms("24h")) }
        });

        const amounts = last24Hours.map((transaction) => (transaction.transferInfo ? transaction.transferInfo.amount : 0));
        const totalAmount = amounts.reduce((a, b) => a + b, 0);

        return {
            totalAmount,
            count: last24Hours.length
        };
    }
}

export default new TransactionService();
