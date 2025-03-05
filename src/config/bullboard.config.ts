import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import sampleQueue from "../queues/sample.Queue.js";
import submissionQueue from "../queues/submission.queue.js";
import evaluationQueue from "../queues/evaluation.queue.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/ui");

createBullBoard({
  queues: [
    new BullMQAdapter(sampleQueue),
    new BullMQAdapter(submissionQueue),
    new BullMQAdapter(evaluationQueue),
  ],
  serverAdapter,
});

export default serverAdapter;
