import { TestCase } from "./testCases";

export type SubmissionPayload = {
  code: string;
  language: string;
  testCases: TestCase[];
  userId: string;
  submissionId: string;
};
