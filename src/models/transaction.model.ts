import mongoose from "mongoose";

export interface ITransaction {
    action: "deposit" | "withdrawal" | "transfer";
    transferInfo?: {
        amount: number;
        senderId: string;
        receiverId: string;
    };
    depositInfo?: {
        price: number;
        userId: string;
        amount: number;
        walletId: string;
        currency: string;
        stripePaymentId: string;
    };
    withdrawalInfo?: {
        userId: string;
        amount: number;
        walletId: string;
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
                walletId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "wallet"
                },
                stripePaymentId: {
                    type: String,
                    required: true
                },
                amount: {
                    type: Number,
                    required: true
                },
                currency: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                }
            },
            required: false
        },

        // Withdrawal
        withdrawalInfo: {
            type: {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "user"
                },
                walletId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "wallet"
                },
                amount: {
                    type: Number,
                    required: true
                }
            },
            required: false
        },

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
