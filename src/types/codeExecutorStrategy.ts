import { TestCase } from "./testCases.js";

export interface CodeExecutorStrategy {
  execute(
    code: string,
    testCases: TestCase[],
    isCustomTest: boolean,
  ): Promise<ExecutionResponse[]>;
}

export type ExecutionResponse = {
  output: string;
  status: string;
  expectedOutput?: string;
};
