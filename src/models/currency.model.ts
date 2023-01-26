import mongoose from "mongoose";

export interface ICurrency extends mongoose.Document {
    name: string;
    code: string;
    gildRate: number;
    isZeroDecimal: Boolean;
    updatedAt: Date;
    createdAt: Date;
}

const currencySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true,
            unique: true
        },
        isZeroDecimal: {
            type: Boolean,
            required: true
        },
        gildRate: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<ICurrency>("currency", currencySchema);
