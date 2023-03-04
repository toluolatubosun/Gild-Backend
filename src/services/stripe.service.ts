import StripeUtil from "./../utils/stripe";
import CustomError from "./../utils/graphql/custom-error";

class UserService {
    async createExpressAccount(userId: string) {
        const { default: UserService } = await import("./user.service");

        const user = await UserService.getOne(userId);
        if (user.stripeAccountId) throw new CustomError("user already has a linked stripe account");

        const account = await StripeUtil.createExpressAccount();
        const accountLink = await StripeUtil.createAccountLink(account.id);

        await UserService.addStripeAccountId(user.id, account.id);

        return accountLink.url;
    }

    async getAccountSetupLink(userId: string) {
        const { default: UserService } = await import("./user.service");

        const user = await UserService.getOne(userId);
        if (!user.stripeAccountId) return await this.createExpressAccount(userId);

        const accountLink = await StripeUtil.createAccountLink(user.stripeAccountId);

        return accountLink.url;
    }

    async getLoginLink(userId: string) {
        const { default: UserService } = await import("./user.service");

        const user = await UserService.getOne(userId);
        if (!user.stripeAccountId) throw new CustomError("user has no linked stripe account");

        const accountLink = await StripeUtil.createLoginLink(user.stripeAccountId);

        return accountLink.url;
    }

    async getAccount(userId: string) {
        const { default: UserService } = await import("./user.service");

        const user = await UserService.getOne(userId);
        if (!user.stripeAccountId) throw new CustomError("user has no linked stripe account");

        const account = await StripeUtil.retrieveAccount(user.stripeAccountId);

        return account;
    }

    async getAccountStatus(stripeAccountId: string | undefined) {
        if (!stripeAccountId) return "not_connected";

        const account = await StripeUtil.retrieveAccount(stripeAccountId);

        if (account.charges_enabled && account.payouts_enabled) {
            return "connected";
        } else {
            return "setup_incomplete";
        }
    }

    async getCardsByUserId(userId: string) {
        const { default: UserService } = await import("./user.service");

        const user = await UserService.getOne(userId);

        const cardData = (await StripeUtil.retrieveCustomerCards(`${user.name}`, user.email)).data;
        const creditCards: CreditCard[] = [];

        cardData.forEach((card) => {
            if (card.card) {
                creditCards.push({
                    id: card.id,
                    brand: card.card.brand,
                    expiryYear: card.card.exp_year,
                    lastFourDigits: card.card.last4,
                    expiryMonth: card.card.exp_month,
                    fingerprint: card.card.fingerprint || "000000000000"
                });
            }
        });

        return creditCards;
    }

    async attachCard(userId: string) {
        const { default: UserService } = await import("./user.service");

        const user = await UserService.getOne(userId);
        const customer = await StripeUtil.retrieveCustomer(`${user.name}`, user.email);

        const intent = await StripeUtil.attachCard(customer.id);

        return intent.client_secret as string;
    }

    async deleteCard(userId: string, cardId: string) {
        const { default: UserService } = await import("./user.service");

        const user = await UserService.getOne(userId);
        const cards = await StripeUtil.retrieveCustomerCards(`${user.name}`, user.email);

        const card = cards.data.find((card: any) => card.id === cardId);
        if (!card) throw new CustomError("card not found");

        await StripeUtil.removeCard(cardId);

        return true;
    }

    async getGildRates() {
        const { default: CurrencyService } = await import("./currency.service");

        return await CurrencyService.getAll();
    }
}

export default new UserService();
