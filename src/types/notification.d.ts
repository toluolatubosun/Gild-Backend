/////////////////////// Service ///////////////////////

interface NotificationCreateInput {
    title: string;
    message: string;
    sourceId: string;
    receiverId: string;
}

/////////////////////// GraphQL Resolvers ///////////////////////

interface NotificationsArgs {
    pagination: PaginationInput;
}

interface NotificationGetAllMineArgs {
    pagination: PaginationInput;
}
