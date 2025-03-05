import { Job } from "bullmq";
import { IJob } from "../types/bullMqJobDefinition.js";
import { SubmissionPayload } from "../types/submissionPayload.js";
import createExecutor from "../utils/executorFactory.js";
import { ExecutionResponse } from "../types/codeExecutorStrategy.js";
import evaluationQueueProducer from "../producers/evaluationQueue.producer.js";

export default class SubmissionJob implements IJob {
  payload: Record<string, SubmissionPayload>;
  name: string;
  constructor(payload: Record<string, SubmissionPayload>) {
    this.payload = payload;
    this.name = this.constructor.name;
  }

  handle = async (job?: Job) => {
    console.log(this.payload);
    if (job) {
      const key = Object.keys(this.payload)[0];
      const codeLanguage = this.payload[key].language;
      const code = this.payload[key].code;
      const inputTestCase = this.payload[key].inputCase;
      const outputTestCase = this.payload[key].outputCase;
      const strategy = createExecutor(codeLanguage);
      console.log("strategy", strategy);
      if (strategy != null) {
        const response: ExecutionResponse = await strategy.execute(
          code,
          inputTestCase,
          outputTestCase,
        );

        evaluationQueueProducer({
          response,
          userId: this.payload[key].userId,
          submissionId: this.payload[key].submissionId,
        });
        if (response.status === "SUCCESS") {
          console.log("Code executed successfully");
          console.log(response);
        } else {
          console.log("Something went wrong with code execution");
          console.log(response);
        }
      }
    }
  };

  failed = (job?: Job): void => {
    console.log("Job failed");
    if (job) {
      console.log(job.id);
    }
  };
}
