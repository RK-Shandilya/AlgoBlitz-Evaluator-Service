import { CPP_IMAGE } from "../utils/constants";
import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy";
import pullImage from "./pullImage";
import createContainer from "./containorFactory";
import decodeDockerStream from "./dockerHelper";

export default class CPPExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCase: string,
    outputTestCase: string,
  ): Promise<ExecutionResponse> {
    console.log(code, inputTestCase, outputTestCase);
    const rawLogBuffer: Buffer[] = [];
    await pullImage(CPP_IMAGE);
    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > Main.cpp && g++ -o Main Main.cpp || exit 1 && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | ./Main`;
    const cppDockerContainer = await createContainer(CPP_IMAGE, [
      "/bin/sh",
      "-c",
      runCommand,
    ]);
    await cppDockerContainer.start();
    console.log("Started the docker container");
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
      const codeResponse: string = await this.fetchDecodeStream(
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
        await cppDockerContainer.kill();
      }
      return { output: error as string, status: "ERROR" };
    } finally {
      try {
        await cppDockerContainer.stop().catch(() => {}); // Ignore stop errors if already stopped
        await cppDockerContainer.remove().catch(() => {});
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
        console.log("Timeout Called");
        rej("TLE");
      }, 2000);
      loggerStream.on("end", () => {
        clearTimeout(timeout);
        console.log(rawLogBuffer);
        const completeBuffer = Buffer.concat(rawLogBuffer);
        console.log(completeBuffer);
        const decodedStream = decodeDockerStream(completeBuffer);
        console.log("decodedStream", decodedStream);
        if (decodedStream.stderr) {
          rej(decodedStream.stderr);
        } else {
          res(decodedStream.stdout);
        }
      });
    });
  }
}
