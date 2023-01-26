import authMutations from "./auth.mutation";
import userMutations from "./user.mutation";
import walletMutations from "./wallet.mutation";

export default {
    ...authMutations,
    ...userMutations,
    ...walletMutations
};
