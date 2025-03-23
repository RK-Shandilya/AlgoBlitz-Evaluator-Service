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
      const isCustomTest = this.payload[key].isCustomTest || false;
      const strategy = createExecutor(language);

      if (strategy != null) {
        let response;
        if (isCustomTest) {
          const customTestCases = JSON.parse(JSON.stringify(testCases));
          const referenceSolutionCode = this.payload[key].refrenceSolution;
          if (referenceSolutionCode) {
            const referenceResults = await strategy.execute(
              referenceSolutionCode,
              customTestCases,
              false,
            );
            for (let i = 0; i < customTestCases.length; i++) {
              if (i < referenceResults.length) {
                customTestCases[i].output = referenceResults[i].output;
              }
            }
            response = await strategy.execute(code, customTestCases, true);
          } else {
            response = await strategy.execute(code, customTestCases, true);
            for (const result of response) {
              result.status = "SUCCESS";
              delete result.expectedOutput;
            }
          }
        } else {
          response = await strategy.execute(code, testCases, false);
          await evaluationQueueProducer({ response, userId, submissionId });
        }
        console.info(JSON.stringify(response, null, 2));
        if (isCustomTest) {
          await evaluationQueueProducer({
            response,
            userId,
            submissionId,
            isCustomTest: true,
          });
        }
      }
    }
  };
  failed = (job?: Job) => {
    console.log("Job failed", job?.id);
  };
}
