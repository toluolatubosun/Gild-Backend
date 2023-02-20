import helloQueries from "./hello.query";
import userQueries from "./user.query";
import walletQueries from "./wallet.query";
import currencyQueries from "./currency.query";
import notificationQueries from "./notification.query";

export default {
    ...helloQueries,
    ...userQueries,
    ...walletQueries,
    ...currencyQueries,
    ...notificationQueries
};
