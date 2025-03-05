import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy.js";
import { GO_IMAGE } from "../utils/constants.js";
import fetchDecodeStream from "../utils/fetchDecodedStream.js";
import createContainer from "./containorFactory.js";
import pullImage from "./pullImage.js";

export default class GoExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCase: string,
    outputTestCase: string,
  ): Promise<ExecutionResponse> {
    const rawLogBuffer: Buffer[] = [];
    await pullImage(GO_IMAGE);
    const runCommand = `
echo '${code.replace(/'/g, `'"'"'`)}' > Main.go &&
go build -o Main Main.go &&
chmod +x Main &&
echo "${inputTestCase}" | ./Main
`;
    const goContainer = await createContainer(GO_IMAGE, [
      "/bin/sh",
      "-c",
      runCommand,
    ]);
    await goContainer.start();
    const loggerStream = await goContainer.logs({
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
        await goContainer.kill();
      }
      return { output: error as string, status: "ERROR" };
    } finally {
      await goContainer.remove();
    }
  }
}
