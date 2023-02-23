import { ROLE } from "../../../config";
import WalletService from "../../../services/wallet.service";
import guard from "../../../middlewares/graphql/guard.middleware";

import type { Context } from "../../../types/graphql";

export default {
    walletInitializeTransfer: async (_: any, { receiverId, amount }: InitializeTransferArgs, context: Context): Promise<Boolean> => {
        const user = guard(context.user, ROLE.USER);
        return await WalletService.initializeTransfer(user.id, receiverId, amount);
    },
    walletInitializeDeposit: async (_: any, { amount, currencyCode }: InitializeDepositArgs, context: Context): Promise<String> => {
        const user = guard(context.user, ROLE.USER);
        return await WalletService.initializeDeposit(user.id, amount, currencyCode);
    },
    walletCompleteTransfer: async (_: any, { receiverId, amount, OTP }: CompleteTransferArgs, context: Context): Promise<Boolean> => {
        const user = guard(context.user, ROLE.USER);
        return await WalletService.completeTransfer(user.id, { receiverId, amount, OTP });
    },
    walletInitializeWithdrawal: async (_: any, { amount }: InitializeWithdrawalArgs, context: Context): Promise<Boolean> => {
        const user = guard(context.user, ROLE.USER);
        return await WalletService.initializeWithdrawal(user.id, amount);
    },
    walletCompleteWithdrawal: async (_: any, { amount, OTP }: GildWithdrawalInput, context: Context): Promise<Boolean> => {
        const user = guard(context.user, ROLE.USER);
        return await WalletService.completeWithdrawal(user.id, { amount, OTP });
    }
};
