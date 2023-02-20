import routes from "./routes";
import { PORT } from "../config";
import errorMiddleware from "../middlewares/rest/error.middleware";

import type { Application } from "express";

export default (app: Application) => {
    app.get("/", (req, res) => {
        res.send("Hello World from Gild!");
    });

    app.use(routes);

    console.log(`:::> 🚀 Rest Server ready at http://localhost:${PORT}`);

    errorMiddleware(app);
};
