interface CreditCard {
    id: string;
    brand: string;
    expiryYear: number;
    expiryMonth: number;
    fingerprint: string;
    lastFourDigits: string;
}

interface stripeDeleteMyCardArgs {
    cardId: string;
}
