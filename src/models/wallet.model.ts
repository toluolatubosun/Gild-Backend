import mongoose from "mongoose";

export interface IWallet extends mongoose.Document {
    balance: number;
    currency: "GILD";
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

const walletSchema: mongoose.Schema = new mongoose.Schema(
    {
        balance: {
            type: Number,
            required: true,
            default: 0
        },
        currency: {
            type: String,
            required: true,
            enum: ["GILD"],
            default: "GILD"
        },

        // Relationships
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IWallet>("wallet", walletSchema);
