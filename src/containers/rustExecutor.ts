import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy";
import { RUST_IMAGE } from "../utils/constants";
import createContainer from "./containorFactory";
import decodeDockerStream from "./dockerHelper";
import pullImage from "./pullImage";

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
      const codeResponse: string = await this.fetchDecodeStream(
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
      try {
        await rustDockerContainer.stop().catch(() => {});
        await rustDockerContainer.remove().catch(() => {});
      } catch (error) {
        console.error("Error while removing container:", error);
      }
    }
  }
  fetchDecodeStream(
    loggerStream: NodeJS.ReadableStream,
    rawLogBuffer: Buffer[],
  ): Promise<string> {
    return new Promise((res, rej) => {
      const timeout = setTimeout(() => {
        console.log("Timeout called");
        rej("TLE");
      }, 2000);
      loggerStream.on("end", () => {
        clearTimeout(timeout);
        console.log(rawLogBuffer);
        const completeBuffer = Buffer.concat(rawLogBuffer);
        const decodedStream = decodeDockerStream(completeBuffer);
        if (decodedStream.stderr) {
          rej(decodedStream.stderr);
        } else {
          res(decodedStream.stdout);
        }
      });
    });
  }
}
