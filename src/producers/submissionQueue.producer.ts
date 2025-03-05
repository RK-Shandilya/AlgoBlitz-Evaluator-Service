import SubmissionQueue from "../queues/submission.queue.js";

export default async function (payload: Record<string, unknown>) {
  console.log("🚀 Adding job to queue:", payload);
  await SubmissionQueue.add("SubmissionJob", payload);
}
