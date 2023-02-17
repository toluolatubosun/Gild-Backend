import mongoose from "mongoose";

export interface ITransaction {
    action: "deposit" | "withdrawal" | "transfer";
    transferInfo?: {
        amount: number;
        senderId: string;
        receiverId: string;
    };
    depositInfo?: {
        userId: string;
        stripePaymentId: string;
    };
}

const transactionSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            enum: ["deposit", "withdrawal", "transfer"]
        },

        // Deposit
        depositInfo: {
            type: {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "user"
                },
                stripePaymentId: {
                    type: String,
                    required: true
                }
            },
            required: false
        },

        // Withdrawal
        // TODO

        // Transfer
        transferInfo: {
            type: {
                senderId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "user"
                },
                receiverId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "user"
                },
                amount: {
                    type: Number,
                    required: true
                }
            },
            required: false
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<ITransaction>("transaction", transactionSchema);
