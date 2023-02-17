import { ROLE } from "../../../config";
import guard from "../../../middlewares/graphql/guard.middleware";
import NotificationService from "../../../services/notification.service";

import type { Context } from "../../../types/graphql";
import type { INotification } from "../../../models/notification.model";

export default {
    notificationGetAllMine: async (_: any, { pagination }: NotificationGetAllMineArgs, context: Context): Promise<{ notifications: INotification[]; pagination: PaginationPayload }> => {
        const user = guard(context.user, ROLE.USER);
        return await NotificationService.getAllForUser(pagination, user.id);
    },
    notifications: async (_: any, { pagination }: NotificationsArgs, context: Context): Promise<{ notifications: INotification[]; pagination: PaginationPayload }> => {
        guard(context.user, ROLE.ADMIN);
        return await NotificationService.getAll(pagination);
    }
};
