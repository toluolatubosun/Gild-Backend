import { ROLE } from "../../../config";
import StripeService from "../../../services/stripe.service";
import guard from "../../../middlewares/graphql/guard.middleware";

import type { Context } from "../../../types/graphql";

export default {
    stripeGetMyCards: async (_: any, __: any, context: Context): Promise<CreditCard[]> => {
        const user = guard(context.user, ROLE.USER);
        return await StripeService.getCardsByUserId(user.id);
    }
};
