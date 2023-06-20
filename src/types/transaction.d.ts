interface TransferRecordInput {
    amount: number;
    senderId: string;
    receiverId: string;
}

interface DepositRecordInput {
    price: number;
    amount: number;
    userId: string;
    walletId: string;
    currency: string;
    stripePaymentId: string;
}

interface WithdrawalRecordInput {
    amount: number;
    userId: string;
    walletId: string;
}

interface TransactionsStats {
    totalDepositCount: number;
    totalDepositAmount: number;
    totalTransferCount: number;
    totalTransferAmount: number;
    totalWithdrawalCount: number;
    totalWithdrawalAmount: number;
}