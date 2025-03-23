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
    isCustomTest?: boolean,
  ): Promise<ExecutionResponse[]> {
    console.log(`Executing with isCustomTest: ${isCustomTest}`);
    const result: ExecutionResponse[] = [];

    console.log("Pulling the c++ image");
    await pullImage(CPP_IMAGE);

    console.log("Initializing c++ container");

    // Create a shell script that will compile and run all test cases
    let shellScript = `echo '${code.replace(/'/g, `'\\"`)}' > main.cpp && g++ main.cpp -o main && `;

    if (isCustomTest && testCases.length > 0) {
      testCases.forEach((testCase, index) => {
        shellScript += `echo "===CUSTOM_TEST_${index}===" && `;
        shellScript += `echo '${testCase.input.replace(/'/g, `'\\"`)}' | timeout ${CPP_TIME_LIMIT / 1000} ./main && `;
        shellScript += `echo "===END_CUSTOM_TEST===" `;
      });
    } else {
      testCases.forEach((testCase, index) => {
        shellScript += `echo "===TEST_CASE_${index}===" && `;
        shellScript += `echo '${testCase.input.replace(/'/g, `'\\"`)}' | timeout ${CPP_TIME_LIMIT / 1000} ./main && `;
        shellScript += `echo "===END_TEST_CASE_${index}===" && `;
      });
      shellScript = shellScript.slice(0, -3);
    }

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

      const timeLimit = isCustomTest
        ? CPP_TIME_LIMIT
        : CPP_TIME_LIMIT * testCases.length;

      const completeOutput = await fetchDecodedStream(
        loggerStream,
        rawLogBuffer,
        timeLimit,
      );

      if (isCustomTest) {
        let customOutput = "";
        const lines = completeOutput.split("\n");
        let captureOutput = false;

        for (const line of lines) {
          if (line.includes("===CUSTOM_TEST===")) {
            captureOutput = true;
          } else if (line.includes("===END_CUSTOM_TEST===")) {
            captureOutput = false;
          } else if (captureOutput) {
            customOutput += line + "\n";
          }
        }

        result.push({
          output: customOutput.trim(),
          status: "CUSTOM_TEST",
          expectedOutput: completeOutput,
        });
      } else {
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
                  status: "WA", // Wrong Answer
                  expectedOutput,
                });
              }
            }
          } else if (currentTestCase >= 0) {
            currentOutput += line + "\n";
          }
        }

        while (result.length < testCases.length) {
          result.push({ output: "TLE", status: "ERROR" });
        }
      }
    } catch (error) {
      console.error(`Container execution error: ${error}`);

      if (isCustomTest) {
        result.push({
          output: `Runtime Error: ${error}`,
          status: "ERROR",
        });
      } else {
        while (result.length < testCases.length) {
          result.push({ output: "MLE", status: "ERROR" });
        }
      }
    } finally {
      await cppDockerContainer.remove();
    }

    return result;
  }
}

export default CppExecutor;
