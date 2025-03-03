import express, { Express } from "express";
import serverConfig from "./config/server.config.js";
import apiRouter from "./routes/index.js";
import SampleWorker from "./workers/sample.worker.js";
import sampleQueueProducer from "./producers/sampleQueue.producer.js";

const app: Express = express();

app.use("/api", apiRouter);

app.listen(serverConfig.PORT, () => {
  console.log(`Server is running at ${serverConfig.PORT}`);

  SampleWorker('SampleQueue');

  sampleQueueProducer('SampleJob', {
    name: 'Rudra',
    company: 'Brane',
    position: 'ASL',
    location: 'Remote | Hry'
  })
});
