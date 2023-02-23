import authMutations from "./auth.mutation";
import userMutations from "./user.mutation";
import walletMutations from "./wallet.mutation";
import stripeMutations from "./stripe.mutation";
import businessMutations from "./business.mutation";

export default {
    ...authMutations,
    ...userMutations,
    ...walletMutations,
    ...stripeMutations,
    ...businessMutations
};
