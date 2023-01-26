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

    async transferInLast24Hours(userId: string) {
        const last24Hours = await Transaction.find({
            "transferInfo.senderId": userId,
            createdAt: { $gte: new Date(new Date().getTime() - ms("24h")) }
        })

        const amounts = last24Hours.map((transaction) => transaction.transferInfo.amount)
        const totalAmount = amounts.reduce((a, b) => a + b, 0);

        return {
            totalAmount,
            count: last24Hours.length,
        };
    }
    
    // TODO :: Deposit

    // TODO :: Withdrawal
}

export default new TransactionService();
