import {
  CodeExecutorStrategy,
  ExecutionResponse,
} from "../types/codeExecutorStrategy.js";
import { TestCase } from "../types/testCases.js";
import { CPP_IMAGE, CPP_TIME_LIMIT } from "../utils/constants.js";
import fetchDecodedStream from "../utils/fetchDecodedStream.js";
import createContainer from "./containorFactory.js";
import pullImage from "./pullImage.js";

class CppExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    testCases: TestCase[],
  ): Promise<ExecutionResponse[]> {
    const result: ExecutionResponse[] = [];
    console.log("Pulling the c++ image");
    await pullImage(CPP_IMAGE);

    console.log("Initializing c++ container");

    // Create a shell script that will compile and run all test cases
    let shellScript = `echo '${code.replace(/'/g, `'\\"`)}' > main.cpp && g++ main.cpp -o main && `;

    // Add commands to run each test case and output a separator between results
    testCases.forEach((testCase, index) => {
      shellScript += `echo "===TEST_CASE_${index}===" && `;
      shellScript += `echo '${testCase.input.replace(/'/g, `'\\"`)}' | timeout ${CPP_TIME_LIMIT / 1000} ./main && `;
      shellScript += `echo "===END_TEST_CASE_${index}===" && `;
    });

    // Remove the trailing '&& '
    shellScript = shellScript.slice(0, -3);

    const cppDockerContainer = await createContainer(CPP_IMAGE, [
      "/bin/sh",
      "-c",
      shellScript,
    ]);

    try {
      await cppDockerContainer.start();
      console.log("Starting the container");

      const rawLogBuffer: Buffer[] = [];
      const loggerStream = await cppDockerContainer.logs({
        stdout: true,
        stderr: true,
        timestamps: false,
        follow: true,
      });

      loggerStream.on("data", (chunk: Buffer) => {
        rawLogBuffer.push(chunk);
      });

      const completeOutput = await fetchDecodedStream(
        loggerStream,
        rawLogBuffer,
        CPP_TIME_LIMIT * testCases.length,
      );

      // Process the output to extract results for each test case
      let currentOutput = "";
      let currentTestCase = -1;

      const lines = completeOutput.split("\n");
      for (const line of lines) {
        if (line.startsWith("===TEST_CASE_")) {
          currentTestCase = parseInt(
            line.replace("===TEST_CASE_", "").replace("===", ""),
          );
          currentOutput = "";
        } else if (line.startsWith("===END_TEST_CASE_")) {
          const testCaseIndex = parseInt(
            line.replace("===END_TEST_CASE_", "").replace("===", ""),
          );
          if (
            testCaseIndex === currentTestCase &&
            currentTestCase < testCases.length
          ) {
            const expectedOutput = testCases[currentTestCase].output.trim();
            if (currentOutput.trim() === expectedOutput) {
              result.push({
                output: currentOutput.trim(),
                status: "SUCCESS",
                expectedOutput,
              });
            } else {
              result.push({
                output: currentOutput.trim(),
                status: "WA",
                expectedOutput,
              });
            }
          }
        } else if (currentTestCase >= 0) {
          currentOutput += line + "\n";
        }
      }

      // Fill in any missing results (e.g., if a test case timed out)
      while (result.length < testCases.length) {
        result.push({ output: "TLE", status: "ERROR" });
      }
    } catch (error) {
      // Handle any container-wide errors
      console.error(`Container execution error: ${error}`);
      while (result.length < testCases.length) {
        result.push({ output: "MLE", status: "ERROR" });
      }
    } finally {
      await cppDockerContainer.remove();
    }

    return result;
  }
}

export default CppExecutor;
