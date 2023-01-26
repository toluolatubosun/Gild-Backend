import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import express from "express";

import type { Application } from "express";

export default (app: Application) => {
    // Set Env File
    dotenv.config({
        path: path.resolve(__dirname, "..", "..", ".env")
    });

    // Enable CORS
    app.use(cors());

    // Secure the app by setting various HTTP headers off.
    app.use(helmet({ contentSecurityPolicy: false }));

    // Logger
    app.use(morgan("common"));

    // Tell express to recognize the incoming Request Object as a JSON Object
    app.use((req, res, next) => {
        if (req.originalUrl === "/webhooks/stripe") {
            express.raw({ type: "application/json" })(req, res, next);
        } else {
            express.json({ limit: "5mb" })(req, res, next);
        }
    });

    // Express body parser
    app.use(express.urlencoded({ limit: "5mb", extended: true }));

    return app;
};
