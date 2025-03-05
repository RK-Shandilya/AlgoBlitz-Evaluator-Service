import { CPP_IMAGE } from "../utils/constants.js";
import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy.js";
import pullImage from "./pullImage.js";
import createContainer from "./containorFactory.js";
import fetchDecodeStream from "../utils/fetchDecodedStream.js";

export default class CPPExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCase: string,
    outputTestCase: string,
  ): Promise<ExecutionResponse> {
    const rawLogBuffer: Buffer[] = [];
    await pullImage(CPP_IMAGE);
    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > Main.cpp && g++ -o Main Main.cpp || exit 1 && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | ./Main`;
    const cppDockerContainer = await createContainer(CPP_IMAGE, [
      "/bin/sh",
      "-c",
      runCommand,
    ]);
    await cppDockerContainer.start();
    const loggerStream = await cppDockerContainer.logs({
      stdout: true,
      stderr: true,
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
        await cppDockerContainer.kill();
      }
      return { output: error as string, status: "ERROR" };
    } finally {
      await cppDockerContainer.remove();
    }
  }
}
