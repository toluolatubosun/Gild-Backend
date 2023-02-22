const typeDefs = `#graphql
    type Query {
        hello: String!

        me: User!
        user(input: UserInfoInput!): User!
        userProfile(input: UserInfoInput!): PublicUser!
        users(pagination: PaginationInput!): UsersPayload!

        walletGetMine: Wallet!
        walletGetOne(walletId: String!): Wallet!
        wallets(pagination: PaginationInput!): WalletsPayload!

        notifications(pagination: PaginationInput!): NotificationsPayload!
        notificationGetAllMine(pagination: PaginationInput!): NotificationsPayload!

        currencies: [Currency!]!
        currencyGetByCode(code: String!): Currency!
    }

    type Mutation {
        authLogin(input: LoginInput!): AuthPayload!
        authLogout(refreshToken: String!): Boolean!
        authRequestPasswordReset(email: String!): Boolean!
        authRefreshAccessToken(refreshToken: String!): String!
        authRequestEmailVerification(email: String!): Boolean!
        authUpdatePassword(oldPassword: String!, newPassword: String!): Boolean!
        authResetPassword(userId: ID!, resetToken: String!, password: String!): Boolean!
        authRegister(input: RegisterInput!, businessData: BusinessDataInput): AuthPayload!
        authVerifyEmail(userId: ID!, verifyToken: String!, businessData: BusinessDataInput): Boolean!

        userDelete(userId: ID!): User!
        userCreate(input: UserDataInput!): User!
        userUpdateMe(input: UserUpdateInput!): User!
        userUpdate(userId: ID!, input: UserDataInput!): User!

        walletInitializeTransfer(receiverId: String!, amount: Int!): Boolean!
        walletInitializeDeposit(amount: Int!, currencyCode: String!): String!
        walletCompleteTransfer(receiverId: String!, amount: Int!, OTP: String!): Boolean!

        businessUpdateMine(businessData: BusinessDataInput!): Business!
    }

    type User {
        id: ID!
        name: String!
        role: String!
        email: String!
        image: String
        username: String!
        createdAt: String!
        updatedAt: String!
        isActive: Boolean!
        isVerified: Boolean!
        wallet: Wallet!
        business: Business
    }

    type Business {
        id: ID!
        city: String!
        state: String!
        country: String!
        industry: String!
        companySize: String!
    }

    type Wallet {
        id: ID!
        balance: Int!
        currency: String!
        user: User
    }

    type PublicUser {
        id: ID!
        name: String!
        role: String!
        image: String
        username: String!
        business: Business
    }

    type Notification {
        id: ID!
        title: String!
        message: String!
        readAt: String
        receiver: User!
        source: PublicUser!
    }

    type Currency {
        id: ID!
        name: String!
        code: String!
        gildRate: Float!
        isZeroDecimal: Boolean!
    }

    type AuthPayload {
        user: User!
        token: AuthTokens!
    }

    type AuthTokens {
        accessToken: String!
        refreshToken: String!
    }

    type PaginationPayload {
        total: Int!
        next: String
        hasNext: Boolean!
    }

    type UsersPayload {
        users: [User!]!
        pagination: PaginationPayload!
    }

    type WalletsPayload {
        wallets: [Wallet!]!
        pagination: PaginationPayload!
    }

    type NotificationsPayload {
        notifications: [Notification!]!
        pagination: PaginationPayload!
    }

    # INPUT TYPES

    input PaginationInput {
        next: ID
        limit: Int
    }

    input BusinessDataInput {
        city: String
        state: String
        country: String
        industry: String
        companySize: String
    }

    input RegisterInput {
        role: Role!
        name: String!
        email: String!
        username: String!
        password: String!
    }

    input LoginInput {
        email: String!
        password: String!
    }

    input UserDataInput {
        role: Role
        name: String
        email: String
        image: String
        password: String
    }

    input UserUpdateInput {
        name: String
        image: String
    }

    input UserInfoInput {
        userId: ID
        username: String
    }

    # ENUM TYPES

    enum Role {
        user
        admin
        system
        business
    }
`;

export default typeDefs;
