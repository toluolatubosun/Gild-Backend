/////////////////////// Service ///////////////////////

interface UserDataInput {
    name?: string;
    email?: string;
    image?: string;
    password?: string;
    role?: Role;
}

interface GetUserInput {
    userId?: string;
    username?: string;
}

/////////////////////// GraphQL Resolvers ///////////////////////

interface UserDataArgs {
    input: UserDataInput;
}

interface UserUpdateArgs {
    userId: string;
    input: UserDataInput;
}

interface UserDeleteArgs {
    userId: string;
}

interface UserArgs {
    input: GetUserInput;
}

interface UsersArgs {
    pagination: PaginationInput;
}
