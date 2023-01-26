import walletService from "../../../services/wallet.service";
import BusinessService from "../../../services/business.service";

import type { IUser } from "../../../models/user.model";
import type { IWallet } from "../../../models/wallet.model";
import type { IBusiness } from "../../../models/business.model";

export default {
    wallet: async (user: IUser, __: any, _: any): Promise<IWallet> => {
        return await walletService.getByUserId(user.id);
    },
    business: async (user: IUser, __: any, _: any): Promise<IBusiness | null> => {
        return await BusinessService.getByUserId(user.id, false);
    }
};
