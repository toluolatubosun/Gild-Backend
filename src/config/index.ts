export const APP_NAME = "Gild";
export const PORT = process.env.PORT || 8080;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const CLOUDINARY_URL = process.env.CLOUDINARY_URL || "";
export const BCRYPT_SALT = Number(process.env.BCRYPT_SALT) || 10;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const JWT_SECRET = process.env.JWT_SECRET || "0000-1234-0000";
export const CURRENCY_LAYER_API_KEY = process.env.CURRENCY_LAYER_API_KEY || "";
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gild";
export const URL = {
    BASE_URL: process.env.BASE_URL || `http://localhost:${PORT}`,
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
    APP_LOGO: process.env.APP_LOGO || "https://picsum.photos/200/300"
};
export const ROLE = {
    ADMIN: ["admin"],
    BUSINESS: ["business", "admin"],
    USER: ["user", "business", "admin"]
};
export const MAILER = {
    USER: process.env.MAILER_USER || "",
    PORT: process.env.MAILER_PORT || 465,
    SECURE: process.env.MAILER_SECURE || false,
    PASSWORD: process.env.MAILER_PASSWORD || "",
    HOST: process.env.MAILER_HOST || "smtp.gmail.com",
    DOMAIN: process.env.MAILER_DOMAIN || "@gild.com"
};
export const STRIPE = {
    SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
    PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY || "",
    WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || ""
};
