export default interface CodeExecutorStrategy {
  execute(
    code: string,
    inputTestCase: string,
    outputTestCase: string,
  ): Promise<ExecutionResponse>;
  //eslint-disable-next-line semi
}

export type ExecutionResponse = { output: string; status: string };
