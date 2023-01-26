interface PaginationInput {
    next?: string;
    limit?: number;
}

interface PaginationPayload {
    total: number;
    hasNext: boolean;
    next: string | null;
}

interface PurchaseGildInput {
    price: number;
    currency: string;
    user: {
        name: string;
        email: string;
    };
    amount: number;
    walletId: string;
}

type Role = "user" | "business" | "admin";
