import { ROLE } from "../../../config";
import StripeService from "../../../services/stripe.service";
import guard from "../../../middlewares/graphql/guard.middleware";

import type { Context } from "../../../types/graphql";

export default {
    stripeDeleteMyCard: async (_: any, { cardId }: stripeDeleteMyCardArgs, context: Context): Promise<boolean> => {
        const user = guard(context.user, ROLE.USER);
        return await StripeService.deleteCard(user.id, cardId);
    },
    stripeAttachCard: async (_: any, __: any, context: Context): Promise<string> => {
        const user = guard(context.user, ROLE.USER);
        return await StripeService.attachCard(user.id);
    },
    stripeSetupExpressAccount: async (_: any, __: any, context: Context): Promise<string> => {
        const user = guard(context.user, ROLE.USER);
        return await StripeService.getAccountSetupLink(user.id);
    }
};
