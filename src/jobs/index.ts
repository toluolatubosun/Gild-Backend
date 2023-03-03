import ms from "ms";
import cron from "node-cron";

import CronJobs from "../models/cron-jobs.model";

// run every 24 hours
export const currencyConversion = cron.schedule(
    "0 0 * * *",
    async () => {
        try {
            const { default: CurrencyService } = await import("../services/currency.service");

            const currencyConversionJob = await CronJobs.findOne({ action: "currency-conversion" });

            if (!currencyConversionJob) {
                await CurrencyService.updateRates();
                await CronJobs.create({ action: "currency-conversion", lastRun: new Date() });
                return;
            }

            const lastInterval = new Date().getTime() - currencyConversionJob.lastRun.getTime();

            if (lastInterval > ms("24h")) {
                await CurrencyService.updateRates();
                await CronJobs.updateOne({ action: "currency-conversion" }, { $set: { lastRun: new Date() } });
                return;
            }
        } catch (error) {
            console.error("Error running currency conversion job", error);
        }
    },
    {
        runOnInit: true,
        scheduled: false
    }
);
