import { ROLE } from "../../../config";
import BusinessService from "../../../services/business.service";
import guard from "../../../middlewares/graphql/guard.middleware";

import type { Context } from "../../../types/graphql";
import type { IBusiness } from "../../../models/business.model";

export default {
    businessUpdateMine: async (_: any, { businessData }: BusinessUpdateMineArgs, context: Context): Promise<IBusiness> => {
        const user = guard(context.user, ROLE.BUSINESS);
        return await BusinessService.updateByUser(user.id, businessData);
    }
};
