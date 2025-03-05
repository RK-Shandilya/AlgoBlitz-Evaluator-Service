import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy.js";
import { RUST_IMAGE } from "../utils/constants.js";
import fetchDecodeStream from "../utils/fetchDecodedStream.js";
import createContainer from "./containorFactory.js";
import pullImage from "./pullImage.js";

export default class RustExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCase: string,
    outputTestCase: string,
  ): Promise<ExecutionResponse> {
    const rawLogBuffer: Buffer[] = [];
    await pullImage(RUST_IMAGE);
    const runCommand = `
    echo '${code.replace(/'/g, `'"'"'`)}' > main.rs && \
    rustc main.rs -o main && \
    echo '${inputTestCase.replace(/'/g, `'"'"'`)}' | ./main
    `;
    const rustDockerContainer = await createContainer(RUST_IMAGE, [
      "/bin/sh",
      "-c",
      runCommand,
    ]);
    await rustDockerContainer.start();
    const loggerStream = await rustDockerContainer.logs({
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
      console.log("Error occurred", error);
      if (error === "TLE") {
        await rustDockerContainer.kill();
      }
      return { output: error as string, status: "ERROR" };
    } finally {
      await rustDockerContainer.remove();
    }
  }
}
