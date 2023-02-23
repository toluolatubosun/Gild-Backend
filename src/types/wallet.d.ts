/////////////////////// Service ///////////////////////

interface CreateWalletInput {
    userId: string;
}

interface GildTransferInput {
    OTP: string;
    amount: number;
    receiverId: string;
}

interface DepositMetadata {
    source: string;
    price: string;
    node_env: string;
    amount: string;
    action: string;
    currency: string;
    wallet_id: string;
    customer_id: string;
}

interface GildWithdrawalInput {
    OTP: string;
    amount: number;
}

/////////////////////// GraphQL Resolvers ///////////////////////

interface WalletsArgs {
    pagination: PaginationInput;
}

interface InitializeTransferArgs {
    amount: number;
    receiverId: string;
}

interface InitializeDepositArgs {
    amount: number;
    currencyCode: string;
}

interface CompleteTransferArgs {
    OTP: string;
    amount: number;
    receiverId: string;
}

interface WalletGetOneArgs {
    walletId: string;
}

interface InitializeWithdrawalArgs {
    amount: number;
}