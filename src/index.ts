import express, { Express } from "express";
import serverConfig from "./config/server.config.js";
import apiRouter from "./routes/index.js";

const app: Express = express();

app.use("/api", apiRouter);

app.listen(serverConfig.PORT, () => {
  console.log(`Server is running at ${serverConfig.PORT}`);
});
