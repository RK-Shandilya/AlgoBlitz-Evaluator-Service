import SubmissionQueue from "../queues/submission.queue.js";

export default async function (payload: Record<string, unknown>) {
  await SubmissionQueue.add("SubmissionJob", payload);
}
