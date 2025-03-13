import { TestCase } from "./testCases";

export default interface CodeExecutorStrategy {
  execute(code: string, testCases: TestCase[]): Promise<ExecutionResponse>;
  //eslint-disable-next-line semi
}

export type ExecutionResponse = { output: string; status: string };
