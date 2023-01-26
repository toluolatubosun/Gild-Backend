import { ROLE } from "../../../config";
import WalletService from "../../../services/wallet.service";
import guard from "../../../middlewares/graphql/guard.middleware";

import type { Context } from "../../../types/graphql";

export default {
    walletInitializeTransfer: async (_: any, { receiverId, amount }: InitializeTransferArgs, context: Context): Promise<Boolean> => {
        const user = guard(context.user, ROLE.USER);
        return await WalletService.initializeTransfer(user.id, receiverId, amount);
    },
    walletCompleteTransfer: async (_: any, { receiverId, amount, OTP }: CompleteTransferArgs, context: Context): Promise<Boolean> => {
        const user = guard(context.user, ROLE.USER);
        return await WalletService.completeTransfer(user.id, { receiverId, amount, OTP });
    }
};
