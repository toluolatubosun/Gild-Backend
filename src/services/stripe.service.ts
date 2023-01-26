import StripeUtil from "./../utils/stripe";
import CustomError from "./../utils/graphql/custom-error";

class UserService {
    async getLoginLink(userId: string) {
        const { default: UserService } = await import("./user.service");

        const user = await UserService.getOne(userId);
        if (!user.stripeAccountId) throw new CustomError("user has no linked stripe account");

        const accountLink = await StripeUtil.createLoginLink(user.stripeAccountId);
        return accountLink;
    }

    async getAccountLink(userId: string) {
        const { default: UserService } = await import("./user.service");

        const user = await UserService.getOne(userId);

        if (!user.stripeAccountId) {
            return await this.createExpressAccount(userId);
        }

        return await StripeUtil.createAccountLink(user.stripeAccountId);
    }

    async createExpressAccount(userId: string) {
        const { default: UserService } = await import("./user.service");

        const user = await UserService.getOne(userId);

        if (user.stripeAccountId) throw new CustomError("user already has a linked stripe account");

        const account = await StripeUtil.createExpressAccount();
        const accountLink = await StripeUtil.createAccountLink(account.id);

        await UserService.addStripeAccountId(user.id, account.id);

        return accountLink;
    }

    async getAccount(userId: string) {
        const { default: UserService } = await import("./user.service");

        const user = await UserService.getOne(userId);
        if (!user.stripeAccountId) throw new CustomError("user has no linked stripe account");

        const account = await StripeUtil.retrieveAccount(user.stripeAccountId);

        return account;
    }

    async getCards(userId: string) {
        const { default: UserService } = await import("./user.service");

        const user = await UserService.getOne(userId);

        const rawCards = await StripeUtil.retrieveCustomerCards(`${user.name}`, user.email);

        const formattedCards = rawCards.data.map((card) => {
            return {
                id: card.id,
                last4: card.card ? card.card.last4 : "0000",
                brand: card.card ? card.card.brand : "UNKNOWN",
                expYear: card.card ? card.card.exp_year : "00",
                expMonth: card.card ? card.card.exp_month : "00",
                fingerprint: card.card ? card.card.fingerprint : "000000000000"
            };
        });

        return formattedCards;
    }

    async attachCard(userId: string, data: any) {
        const { default: UserService } = await import("./user.service");

        const user = await UserService.getOne(userId);
        const customer = await StripeUtil.retrieveCustomer(`${user.name}`, user.email);

        const intent = await StripeUtil.attachCard(customer.id, data);

        return { clientSecret: intent.client_secret };
    }

    async deleteCard(userId: string, cardId: string) {
        const { default: UserService } = await import("./user.service");

        const user = await UserService.getOne(userId);
        const cards = await StripeUtil.retrieveCustomerCards(`${user.name}`, user.email);

        const card = cards.data.find((card: any) => card.id === cardId);
        if (!card) throw new CustomError("card not found");

        return await StripeUtil.removeCard(cardId);
    }

    async getGildRates() {
        const { default: CurrencyService } = await import("./currency.service");

        return await CurrencyService.getAll();
    }
}

export default new UserService();
