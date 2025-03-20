import { Job } from "bullmq";

import evaluationQueueProducer from "../producers/evaluationQueue.producer.js";
import { IJob } from "../types/bullMqJobDefinition.js";
import { SubmissionPayload } from "../types/submissionPayload.js";
import createExecutor from "../utils/executorFactory.js";

export default class SubmissionJob implements IJob {
  name: string;
  payload: Record<string, SubmissionPayload>;

  constructor(payload: Record<string, SubmissionPayload>) {
    this.name = this.constructor.name;
    this.payload = payload;
  }

  handle = async (job?: Job) => {
    console.log("Handler of the job is called");
    if (job) {
      const key = Object.keys(this.payload)[0];
      const code = this.payload[key].code;
      const language = this.payload[key].language;
      const userId = this.payload[key].userId;
      const submissionId = this.payload[key].submissionId;
      const testCases = this.payload[key].testCases;
      const strategy = createExecutor(language);

      if (strategy != null) {
        const response = await strategy.execute(code, testCases);
        console.info(JSON.stringify(response, null, 2));
        await evaluationQueueProducer({ response, userId, submissionId });
      }
    }
  };
  failed = (job?: Job) => {
    console.log("Job failed", job?.id);
  };
}
