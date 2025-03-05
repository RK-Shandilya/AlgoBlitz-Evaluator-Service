import { Job, Worker } from "bullmq";
import SubmissionJob from "../jobs/submission.job.js";
import redisConnection from "../config/redis.config.js";

export default function SubmissionWorker(queueName: string) {
  new Worker(
    queueName,
    async (job: Job) => {
      if (job.name === "SubmissionJob") {
        const submissionJobInstance = new SubmissionJob(job.data);
        console.log("Calling job handler");
        submissionJobInstance.handle(job);
        return true;
      }
    },
    { connection: redisConnection },
  );
}
