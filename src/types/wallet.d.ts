/////////////////////// Service ///////////////////////

interface CreateWalletInput {
    userId: string;
}

interface GildTransferInput {
    OTP: string;
    amount: number;
    receiverId: string;
}

/////////////////////// GraphQL Resolvers ///////////////////////

interface WalletsArgs {
    pagination: PaginationInput;
}

interface InitializeTransferArgs {
    amount: number;
    receiverId: string;
}

interface CompleteTransferArgs {
    OTP: string;
    amount: number;
    receiverId: string;
}
