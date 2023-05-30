import mongoose from "mongoose";

export interface ISettings extends mongoose.Document {
    minimumWithdrawal: number;
    maximumWithdrawal: number;
    minimumTransfer: number;
    maximumTransfer: number;
    minimumDeposit: number;
    maximumDeposit: number;
    maximumDailyTransfer: number;
}

const settingsSchema = new mongoose.Schema(
    {
        minimumWithdrawal: {
            type: Number,
            required: true
        },
        maximumWithdrawal: {
            type: Number,
            required: true
        },

        minimumTransfer: {
            type: Number,
            required: true
        },
        maximumTransfer: {
            type: Number,
            required: true
        },

        minimumDeposit: {
            type: Number,
            required: true
        },
        maximumDeposit: {
            type: Number,
            required: true
        },

        maximumDailyTransfer: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<ISettings>("settings", settingsSchema);
