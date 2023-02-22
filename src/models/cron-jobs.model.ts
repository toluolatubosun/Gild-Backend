import mongoose from "mongoose";

export interface ICronJobs {
    action: "currency-conversion";
    lastRun: Date;
}

const cronJobsSchema = new mongoose.Schema({
    action: {
        type: String,
        unique: true,
        required: true,
        enum: ["currency-conversion"]
    },
    lastRun: {
        type: Date,
        required: true
    }
});

export default mongoose.model<ICronJobs>("cron-jobs", cronJobsSchema);
