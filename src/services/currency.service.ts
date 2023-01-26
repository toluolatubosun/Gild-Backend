import axios from "axios";

import Currency from "../models/currency.model";
import { CURRENCY_LAYER_API_KEY } from "../config";

class CurrencyService {
    async getLatestRates() {
        const response = await axios.get("https://api.apilayer.com/currency_data/live", {
            params: {
                source: "USD",
                currencies: "NGN,EUR,INR,GBP,CAD"
            },
            headers: {
                apiKey: CURRENCY_LAYER_API_KEY
            }
        });

        const { quotes } = response.data;

        Object.keys(quotes).forEach((key: string) => {
            const newKey = key.replace("USD", "");
            quotes[newKey] = Math.round(quotes[key] * 1.05 * 100) / 100; // +5% and round to 2 decimal places
            delete quotes[key];
        });

        quotes.USD = 1.0;

        return quotes;
    }

    async updateRates() {
        const rates = await this.getLatestRates();

        await Promise.all(
            Object.keys(rates).map(async (code) => {
                const rate = rates[code];
                await Currency.updateOne({ code }, { $set: { gildRate: rate } });
            })
        );
    }

    async getAll() {
        return await Currency.find({});
    }

    async getByCode(code: string) {
        return await Currency.findOne({ code });
    }
}

export default new CurrencyService();
