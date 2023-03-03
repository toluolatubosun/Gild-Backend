import StripeUtil from "./../utils/stripe";
import { NODE_ENV, APP_NAME } from "./../config";

class WebhookService {
    async demo() {
        return {
            amount: 1000,
            currency: "USD",
            method: "transfer",
            payment: "success"
        };
    }

    async stripe(data: any, headers: any) {
        const { default: WalletService } = await import("./wallet.service");

        const signature = headers["stripe-signature"];
        const event = await StripeUtil.constructWebhookEvent(data, signature);

        switch (event.type) {
            case "payment_intent.succeeded": {
                const status = (event.data.object as any).status;
                const metadata = (event.data.object as any).metadata;
                const paymentIntentId = (event.data.object as any).id;

                if (metadata.source !== APP_NAME || metadata.node_env !== NODE_ENV) break;

                if (metadata.action === "gild_purchase" && status === "succeeded") {
                    await WalletService.completeDeposit(metadata, paymentIntentId);
                    await StripeUtil.removeCustomerDuplicateCards(metadata.customer_id);
                }

                break;
            }

            default: {
                break;
            }
        }

        return true;
    }
}

export default new WebhookService();
