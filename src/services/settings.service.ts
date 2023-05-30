import Settings from "../models/settings.model";

class SettingsService {
    async create() {
        const settings = await Settings.findOne();
        if (settings) return settings;

        return await new Settings({
            minimumDeposit: 10,
            maximumDeposit: 250,
            minimumTransfer: 10,
            maximumTransfer: 100,
            minimumWithdrawal: 50,
            maximumWithdrawal: 250,
            maximumDailyTransfer: 5
        }).save();
    }

    async getSettings() {
        const settings = await Settings.findOne();
        if (!settings) return await this.create();

        return settings;
    }

    async updateSettings(data: SettingsUpdateInput) {
        const settings = await this.getSettings();

        const updatedSettings = await Settings.findOneAndUpdate({ _id: settings._id }, { $set: data }, { new: true });
        if (!updatedSettings) throw new Error("Settings not updated");

        return updatedSettings;
    }
}

export default new SettingsService();
