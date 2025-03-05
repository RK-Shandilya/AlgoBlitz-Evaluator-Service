import express from "express";
import serverConfig from "./config/server.config.js";
import apiRouter from "./routes/index.js";
import SampleWorker from "./workers/sample.worker.js";
import serverAdapter from "./config/bullboard.config.js";
import { submission_queue } from "./utils/constants.js";
import SubmissionWorker from "./workers/submission.worker.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.use("/api", apiRouter);
app.use("/ui", serverAdapter.getRouter());

app.listen(serverConfig.PORT, async () => {
  console.log(`Server is running at ${serverConfig.PORT}`);
  console.log(
    `BullBoard dashboard running on: http://localhost:${serverConfig.PORT}/ui`,
  );
  SampleWorker("SampleQueue");
  SubmissionWorker(submission_queue);
});
