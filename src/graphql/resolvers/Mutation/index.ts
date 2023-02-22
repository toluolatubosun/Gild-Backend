import authMutations from "./auth.mutation";
import userMutations from "./user.mutation";
import walletMutations from "./wallet.mutation";
import businessMutations from "./business.mutation";

export default {
    ...authMutations,
    ...userMutations,
    ...walletMutations,
    ...businessMutations
};
