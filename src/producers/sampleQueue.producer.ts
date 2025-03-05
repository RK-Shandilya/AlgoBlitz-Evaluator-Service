import sampleQueue from "../queues/sample.Queue.js";

export default async function (name: string, payload: Record<string, unknown>) {
  await sampleQueue.add(name, payload);
}
