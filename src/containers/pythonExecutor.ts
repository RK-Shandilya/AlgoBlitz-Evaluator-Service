import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy.js";
import { PYTHON_IMAGE } from "../utils/constants.js";
import fetchDecodeStream from "../utils/fetchDecodedStream.js";
import createContainer from "./containorFactory.js";
import pullImage from "./pullImage.js";

export default class PythonExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCase: string,
    outputTestCase: string,
  ): Promise<ExecutionResponse> {
    const rawLogBuffer: Buffer[] = [];
    await pullImage(PYTHON_IMAGE);
    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > test.py && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | python3 test.py`;
    const pythonContainer = await createContainer(PYTHON_IMAGE, [
      "/bin/sh",
      "-c",
      runCommand,
    ]);
    await pythonContainer.start();
    const loggerStream = await pythonContainer.logs({
      stderr: true,
      stdout: true,
      follow: true,
      timestamps: false,
    });
    loggerStream.on("data", (chunk) => {
      rawLogBuffer.push(chunk);
    });

    try {
      const codeResponse: string = await fetchDecodeStream(
        loggerStream,
        rawLogBuffer,
      );
      console.log("codeResponse", codeResponse);
      if (codeResponse.trim() === outputTestCase.trim()) {
        return { output: codeResponse, status: "SUCCESS" };
      } else {
        return { output: codeResponse, status: "WA" };
      }
    } catch (error) {
      console.log("Error occurred", error);
      if (error === "TLE") {
        await pythonContainer.kill();
      }
      return { output: error as string, status: "ERROR" };
    } finally {
      await pythonContainer.remove();
    }
  }
}
