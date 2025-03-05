import express, { Express } from "express";
import serverConfig from "./config/server.config.js";
import apiRouter from "./routes/index.js";
import SampleWorker from "./workers/sample.worker.js";
import serverAdapter from "./config/bullboard.config.js";
import { submission_queue } from "./utils/constants.js";
import SubmissionWorker from "./workers/submission.worker.js";
import submissionQueueProducer from "./producers/submissionQueue.producer.js";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.use("/api", apiRouter);
app.use("/ui", serverAdapter.getRouter());

app.listen(serverConfig.PORT, () => {
  console.log(`Server is running at ${serverConfig.PORT}`);
  console.log(
    `BullBoard dashboard running on: http://localhost:${serverConfig.PORT}/ui`,
  );
  SampleWorker("SampleQueue");
  submissionQueueProducer({
    submission1: {
      language: "java",
      outputCase: "50",
      inputCase: "3 4 5",
      code: `
        import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String[] numbers = scanner.nextLine().split(" ");
        int sumOfSquares = 0;

        for (String num : numbers) {
            int value = Integer.parseInt(num);
            sumOfSquares += value * value;
        }

        System.out.println(sumOfSquares);
        scanner.close();
    }
}
    `,
    },
  });
  SubmissionWorker(submission_queue);
});
