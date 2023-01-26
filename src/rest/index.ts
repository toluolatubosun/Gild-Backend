import routes from "./routes";
import errorMiddleware from "../middlewares/rest/error.middleware";

import type { Application } from "express";

export default (app: Application) => {
    app.get("/", (req, res) => {
        res.send("Hello World from Gild!");
    });

    app.use(routes);

    errorMiddleware(app);
};
