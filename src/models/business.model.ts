import mongoose from "mongoose";

export interface IBusiness extends mongoose.Document {
    companySize: "1-50" | "51-100" | "101-500" | "500+";
    city: string;
    state: string;
    country: string;
    industry: string;
}

const businessSchema: mongoose.Schema = new mongoose.Schema(
    {
        companySize: {
            type: String,
            required: true,
            enum: ["1-50", "51-100", "101-500", "500+"]
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        industry: {
            type: String,
            required: true
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

export default mongoose.model<IBusiness>("business", businessSchema);
