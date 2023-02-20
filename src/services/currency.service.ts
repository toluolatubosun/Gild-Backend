import axios from "axios";

import Currency from "../models/currency.model";
import { CURRENCY_LAYER_API_KEY } from "../config";
import CustomError from "../utils/graphql/custom-error";

class CurrencyService {
    async init() {
        const currenciesCount = await Currency.countDocuments({});

        if (currenciesCount === 0) {
            const rates = [
                { name: "Euro", code: "EUR", gildRate: 0.84, isZeroDecimal: false },
                { name: "Indian Rupee", code: "INR", gildRate: 73.0, isZeroDecimal: false },
                { name: "Pound Sterling", code: "GBP", gildRate: 0.72, isZeroDecimal: false },
                { name: "Canadian Dollar", code: "CAD", gildRate: 1.27, isZeroDecimal: false },
                { name: "Nigerian Naira", code: "NGN", gildRate: 360.0, isZeroDecimal: false },
                { name: "United States Dollar", code: "USD", gildRate: 1.0, isZeroDecimal: false }
            ];

            await Currency.insertMany(rates);

            await this.updateRates();
        }
    }

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
        const currenciesCount = await Currency.countDocuments({});

        if (currenciesCount === 0) {
            await this.init();
        }

        return await Currency.find({});
    }

    async getByCode(code: string) {
        const currency = await Currency.findOne({ code });

        if (!currency) throw new CustomError("Currency not found");

        return currency;
    }
}

export default new CurrencyService();
