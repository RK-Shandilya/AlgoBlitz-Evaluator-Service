import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy.js";
import { JAVASCRIPT_IMAGE } from "../utils/constants.js";
import fetchDecodeStream from "../utils/fetchDecodedStream.js";
import createContainer from "./containorFactory.js";
import pullImage from "./pullImage.js";

export default class JavaScriptExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCase: string,
    outputTestCase: string,
  ): Promise<ExecutionResponse> {
    const rawLogBuffer: Buffer[] = [];
    await pullImage(JAVASCRIPT_IMAGE);
    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > Main.js && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | node Main.js`;
    const jsDockerContainer = await createContainer(JAVASCRIPT_IMAGE, [
      "/bin/sh",
      "-c",
      runCommand,
    ]);
    await jsDockerContainer.start();
    const loggerStream = await jsDockerContainer.logs({
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
      if (codeResponse.trim() === outputTestCase.trim()) {
        return { output: codeResponse, status: "SUCCESS" };
      } else {
        return { output: codeResponse, status: "WA" };
      }
    } catch (error) {
      console.log("Error while executing the code", error);
      if (error === "TLE") {
        await jsDockerContainer.kill();
      }
      return { output: error as string, status: "ERROR" };
    } finally {
      await jsDockerContainer.remove();
    }
  }
}
