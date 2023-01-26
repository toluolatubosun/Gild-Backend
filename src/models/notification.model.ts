import mongoose from "mongoose";

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
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        source: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
    },
    {
        timestamps: true
    }
);

export default mongoose.model("notification", notificationSchema);
