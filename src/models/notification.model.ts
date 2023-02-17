import mongoose from "mongoose";

export interface INotification extends mongoose.Document {
    title: string;
    message: string;
    readAt: Date;
    receiverId: string;
    sourceId: string;
    updatedAt: Date;
    createdAt: Date;
}

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        readAt: {
            type: Date,
            required: false
        },
        expiresAt: {
            type: Date,
            required: true,
            default: Date.now,
            expires: 60 // 1 minutes grace period
        },

        // Relationship
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        sourceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<INotification>("notification", notificationSchema);
