import { ROLE } from "../../../config";
import WalletService from "../../../services/wallet.service";
import guard from "../../../middlewares/graphql/guard.middleware";

import type { Context } from "../../../types/graphql";
import type { IWallet } from "../../../models/wallet.model";

export default {
    walletGetOne: async (_: any, { walletId }: WalletGetOneArgs, context: Context): Promise<IWallet> => {
        guard(context.user, ROLE.ADMIN);
        return await WalletService.getOne(walletId);
    },
    walletGetMine: async (_: any, __: any, context: Context): Promise<IWallet> => {
        const user = guard(context.user, ROLE.USER);
        return await WalletService.getByUserId(user.id);
    },
    wallets: async (_: any, { pagination }: WalletsArgs, context: Context): Promise<{ wallets: IWallet[]; pagination: PaginationPayload }> => {
        guard(context.user, ROLE.ADMIN);
        return await WalletService.getAll(pagination);
    }
};
