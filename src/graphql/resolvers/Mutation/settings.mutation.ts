import settingsService from "../../../services/settings.service";
import guard from "../../../middlewares/graphql/guard.middleware";

import { ROLE } from "../../../config";
import { Context } from "../../../types/graphql";
import { ISettings } from "../../../models/settings.model";

export default {
    settingsUpdate: async (_: any, { input }: { input: SettingsUpdateInput }, context: Context): Promise<ISettings> => {
        guard(context.user, ROLE.ADMIN);
        return await settingsService.updateSettings(input);
    }
};
