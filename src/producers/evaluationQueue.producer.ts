import EvaluationQueue from "../queues/evaluation.queue.js";

export default async function (payload: Record<string, unknown>) {
  await EvaluationQueue.add("EvaluationJob", payload);
}
