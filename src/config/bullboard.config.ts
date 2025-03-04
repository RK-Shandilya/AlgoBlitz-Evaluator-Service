import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import sampleQueue from "../queues/sample.Queue";
import submissionQueue from "../queues/submission.queue";
import evaluationQueue from "../queues/evaluation.queue";

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
