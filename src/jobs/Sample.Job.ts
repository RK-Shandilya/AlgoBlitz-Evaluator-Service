import { Job } from "bullmq";
import { IJob } from "../types/bullMqJobDefinition.js";

export default class SampleJob implements IJob {
  name: string;
  payload?: Record<string, unknown>;

  constructor(payload: Record<string, unknown>) {
    this.payload = payload;
    this.name = this.constructor.name;
  }

  handle = (job?: Job) => {
    if (job) {
      console.log("In handle", job.name, job.id, job.data);
    }
  };

  failed = (job?: Job): void => {
    console.log("Job id", job?.id);
  };
}
