import CurrencyService from "../../../services/currency.service";

import type { ICurrency } from "../../../models/currency.model";

export default {
    currencies: async (_: any, __: any, ___: any): Promise<ICurrency[]> => {
        return await CurrencyService.getAll();
    },
    currencyGetByCode: async (_: any, { code }: CurrencyGetByCodeArgs, __: any): Promise<ICurrency> => {
        return await CurrencyService.getByCode(code);
    }
};
