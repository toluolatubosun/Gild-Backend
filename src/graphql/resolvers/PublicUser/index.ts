import BusinessService from "../../../services/business.service";

import type { IUser } from "../../../models/user.model";
import type { IBusiness } from "../../../models/business.model";

export default {
    business: async (user: IUser, __: any, _: any): Promise<IBusiness | null> => {
        return await BusinessService.getByUserId(user.id, false);
    }
};
