import { ROLE } from "../../../config";
import walletService from "../../../services/wallet.service";
import guard from "../../../middlewares/graphql/guard.middleware";

import type { Context } from "../../../types/graphql";
import type { IWallet } from "../../../models/wallet.model";

export default {
    wallets: async (_: any, { pagination }: WalletsArgs, context: Context): Promise<{ wallets: IWallet[]; pagination: PaginationPayload }> => {
        guard(context.user, ROLE.ADMIN);
        return await walletService.getAll(pagination);
    }
};
