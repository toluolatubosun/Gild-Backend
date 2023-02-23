import Stripe from "stripe";

import { STRIPE, URL, NODE_ENV, APP_NAME } from "../config";

class StripeUtil {
    stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(STRIPE.SECRET_KEY, { apiVersion: "2022-11-15" });
    }

    /** Creates a Stripe Express Account */
    async createExpressAccount() {
        const baseURL = URL.CLIENT_URL.includes("localhost") ? "https://dev.gild.com" : URL.CLIENT_URL;

        const account = await this.stripe.accounts.create({
            type: "express",
            business_type: "individual",
            business_profile: { url: `${baseURL}/dashboard/` }
        });

        return account;
    }

    /** Generate Strip Onboarding Link  */
    async createAccountLink(accountId: string) {
        const accountLink = await this.stripe.accountLinks.create({
            account: accountId,
            type: "account_onboarding",
            return_url: `${URL.CLIENT_URL}/dashboard`,
            refresh_url: `${URL.CLIENT_URL}/dashboard`
        });

        return accountLink;
    }

    /** Get Stripe Account Details */
    async retrieveAccount(accountId: string) {
        const account = await this.stripe.accounts.retrieve(accountId);

        return account;
    }

    /** Generate Stripe Login Link */
    async createLoginLink(accountId: string) {
        const accountLink = await this.stripe.accounts.createLoginLink(accountId);

        return accountLink;
    }

    async retrievePaymentIntent(paymentIntentId: string) {
        return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    }

    async constructWebhookEvent(data: any, signature: any) {
        return await this.stripe.webhooks.constructEvent(data, signature, STRIPE.WEBHOOK_SECRET);
    }

    async retrieveCustomer(name: string, email: string) {
        const customer = await this.stripe.customers.list({ email });

        if (customer.data.length === 0) return await this.stripe.customers.create({ name, email });
        else return customer.data[0];
    }

    async retrieveCustomerCards(name: string, email: string) {
        const customer = await this.retrieveCustomer(name, email);

        const cards = await this.stripe.paymentMethods.list({
            type: "card",
            customer: customer.id
        });

        return cards;
    }

    async attachCard(customerId: string) {
        return await this.stripe.setupIntents.create({
            customer: customerId,
            payment_method_types: ["card"]
        });
    }

    async removeCard(paymentMethodId: string) {
        return await this.stripe.paymentMethods.detach(paymentMethodId);
    }

    async removeCustomerDuplicateCards(customerId: string) {
        const cards = await this.stripe.paymentMethods.list({
            type: "card",
            customer: customerId
        });

        const fingerPrints: string[] = [];

        if (cards.data && cards.data.length > 0) {
            for (let i = 0; i < cards.data.length; i++) {
                const cardData = cards.data[i];

                if (cardData.card && cardData.card.fingerprint) {
                    if (!fingerPrints.includes(cardData.card.fingerprint)) {
                        fingerPrints.push(cardData.card.fingerprint);
                    } else {
                        await this.removeCard(cardData.id);
                    }
                }
            }
        }

        return true;
    }

    async refund(paymentIntentId: string) {
        return await this.stripe.refunds.create({ payment_intent: paymentIntentId });
    }

    async payout(accountId: string, amount: number, description: string, currency = "usd") {
        return await this.stripe.transfers.create({
            currency,
            description,
            destination: accountId,
            amount: amount * 100 // amount in cents
        });
    }

    async purchaseGild(data: PurchaseGildInput) {
        const customer = await this.retrieveCustomer(data.user.name, data.user.email);

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: data.price,
            customer: customer.id,
            currency: data.currency,
            description: `${data.user.name}<${data.user.email}> purchased ${data.amount} Gild Tokens`,
            automatic_payment_methods: {
                enabled: true
            },
            metadata: {
                source: APP_NAME,
                price: data.price,
                node_env: NODE_ENV,
                amount: data.amount,
                action: "gild_purchase",
                currency: data.currency,
                wallet_id: data.walletId,
                customer_id: customer.id
            },
            setup_future_usage: "on_session"
        });

        return paymentIntent;
    }
}

export default new StripeUtil();
