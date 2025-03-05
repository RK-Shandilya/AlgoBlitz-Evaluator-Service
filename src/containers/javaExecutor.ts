import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy.js";
import { JAVA_IMAGE } from "../utils/constants.js";
import createContainer from "./containorFactory.js";
import pullImage from "./pullImage.js";
import fetchDecodeStream from "../utils/fetchDecodedStream.js";

export default class JavaExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCase: string,
    outputTestCase: string,
  ): Promise<ExecutionResponse> {
    console.log("Java Executor Called");
    console.log(code, inputTestCase, outputTestCase);

    const rawLogBuffer: Buffer[] = [];
    await pullImage(JAVA_IMAGE);
    console.log("Initialising a new java docker container");
    console.log(`Code received is \n ${code.replace(/'/g, `'\\"`)}`);
    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > Main.java && javac Main.java && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | java Main`;
    console.log(runCommand);
    const javaDockerContainer = await createContainer(JAVA_IMAGE, [
      "/bin/sh",
      "-c",
      runCommand,
    ]);
    await javaDockerContainer.start();
    const loggerStream = await javaDockerContainer.logs({
      stdout: true,
      stderr: true,
      timestamps: false,
      follow: true,
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
        await javaDockerContainer.kill();
      }
      return { output: error as string, status: "ERROR" };
    } finally {
      await javaDockerContainer.remove();
    }
  }
}
