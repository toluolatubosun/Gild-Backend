import UserService from "../../../services/user.service";

import type { IUser } from "../../../models/user.model";
import type { INotification } from "../../../models/notification.model";

export default {
    source: async (notification: INotification, __: any, _: any): Promise<IUser> => {
        return await UserService.getOne(notification.sourceId);
    }
};
