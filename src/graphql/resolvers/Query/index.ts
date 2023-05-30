import helloQueries from "./hello.query";
import userQueries from "./user.query";
import walletQueries from "./wallet.query";
import stripeQueries from "./stripe.query";
import currencyQueries from "./currency.query";
import settingsQueries from "./settings.query";
import notificationQueries from "./notification.query";

export default {
    ...helloQueries,
    ...userQueries,
    ...walletQueries,
    ...stripeQueries,
    ...currencyQueries,
    ...settingsQueries,
    ...notificationQueries
};
