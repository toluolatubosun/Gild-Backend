import UserService from "../../../services/user.service";

import type { IUser } from "../../../models/user.model";
import type { IWallet } from "../../../models/wallet.model";

export default {
    user: async (wallet: IWallet, __: any, _: any): Promise<IUser> => {
        return await UserService.getOne(wallet.userId);
    }
};
