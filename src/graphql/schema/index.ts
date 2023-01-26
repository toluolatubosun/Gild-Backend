import { gql } from "apollo-server-express";

const typeDefs = gql`
    type Query {
        hello: String!

        me: User!
        user(input: UserInfoInput!): User!
        userProfile(input: UserInfoInput!): PublicUser!
        users(pagination: PaginationInput!): UsersPayload!

        walletGetOne: Wallet!
        walletGetMine: Wallet!
        wallets(pagination: PaginationInput!): WalletPayload!
    }

    type Mutation {
        authLogin(input: LoginInput!): AuthPayload!
        authLogout(refreshToken: String!): Boolean!
        authRegister(input: RegisterInput!): AuthPayload!
        authRequestPasswordReset(email: String!): Boolean!
        authRefreshAccessToken(refreshToken: String!): String!
        authRequestEmailVerification(email: String!): Boolean!
        authUpdatePassword(oldPassword: String!, newPassword: String!): Boolean!
        authResetPassword(userId: ID!, resetToken: String!, password: String!): Boolean!
        authVerifyEmail(userId: ID!, verifyToken: String!, businessData: BusinessDataInput): Boolean!

        userDelete(userId: ID!): User!
        userCreate(input: UserDataInput!): User!
        userUpdateMe(input: UserDataInput!): User!
        userUpdate(userId: ID!, input: UserDataInput!): User!

        walletInitializeTransfer(receiverId: String!, amount: Int!): Boolean!
        walletCompleteTransfer(receiverId: String!, amount: Int!, OTP: String!): Boolean!
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
        companySize: String!
        city: String!
        state: String!
        country: String!
        industry: String!
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

    type WalletPayload {
        wallets: [Wallet!]!
        pagination: PaginationPayload!
    }

    # INPUT TYPES

    input PaginationInput {
        next: ID
        limit: Int
    }

    input BusinessDataInput {
        companySize: String!
        city: String!
        state: String!
        country: String!
        industry: String!
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

    input UserInfoInput {
        userId: ID
        username: String
    }

    # ENUM TYPES

    enum Role {
        user
        business
        admin
    }
`;

export default typeDefs;
