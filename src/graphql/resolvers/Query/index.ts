import helloQueries from "./hello.query";
import userQueries from "./user.query";
import walletQueries from "./wallet.query";

export default {
    ...helloQueries,
    ...userQueries,
    ...walletQueries
};
