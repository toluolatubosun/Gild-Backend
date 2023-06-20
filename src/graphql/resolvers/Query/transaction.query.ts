import guard from "../../../middlewares/graphql/guard.middleware";
import TransactionService from "../../../services/transaction.service";

import { ROLE } from "../../../config";
import { Context } from "../../../types/graphql";

export default {
    transactionsGetStats: async (_: any, __: any, context: Context): Promise<TransactionsStats> => {
        guard(context.user, ROLE.ADMIN)
        return await TransactionService.getTransactionStats()
    }
}

