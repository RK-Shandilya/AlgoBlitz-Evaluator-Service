// import { PYTHON_IMAGE } from "../utils/constants.js";
// import CodeExecutorStrategy, {
//   ExecutionResponse,
// } from "../types/codeExecutorStrategy.js";
// import pullImage from "./pullImage.js";
// import createContainer from "./containorFactory.js";
// import { TestCase } from "../types/testCases.js";
// import * as fs from "fs/promises";
// import * as path from "path";
// import * as os from "os";
// import { ContainerCreateOptions } from "dockerode";
// import fetchDecodeStream from "../utils/fetchDecodedStream.js";

// export default class PythonExecutor implements CodeExecutorStrategy {
//   async execute(
//     code: string,
//     testCases: TestCase[],
//   ): Promise<ExecutionResponse> {
//     console.log(testCases);
//     let tempDir = "";
//     let pythonDockerContainer = null;

//     try {
//       await pullImage(PYTHON_IMAGE);
//       tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "python-execution-"));

//       // Write code file
//       await fs.writeFile(path.join(tempDir, "solution.py"), code, {
//         encoding: "utf8",
//       });

//       // Commands and container options
//       const runCommand = "cd /code && python solution.py";

//       const containerOptions: ContainerCreateOptions = {
//         Image: PYTHON_IMAGE,
//         Cmd: ["/bin/sh", "-c", runCommand],
//         HostConfig: {
//           Binds: [`${tempDir}:/code`],
//           Memory: 512 * 1024 * 1024,
//           MemorySwap: 512 * 1024 * 1024,
//           CpuPeriod: 100000,
//           CpuQuota: 75000,
//           Tmpfs: { "/tmp": "rw,noexec,nosuid,size=1g" },
//         },
//         Env: ["PYTHONUNBUFFERED=1"],
//       };

//       // Create, start container and get output
//       pythonDockerContainer = await createContainer(
//         PYTHON_IMAGE,
//         containerOptions.Cmd!,
//         containerOptions,
//       );
//       await pythonDockerContainer.start();

//       const logStream = await pythonDockerContainer.logs({
//         follow: true,
//         stdout: true,
//         stderr: true,
//       });
//       const rawLogBuffer: Buffer[] = [];
//       logStream.on("data", (chunk: Buffer) => rawLogBuffer.push(chunk));

//       const output = await fetchDecodeStream(logStream, rawLogBuffer);

//       const waitResult = await pythonDockerContainer.wait();
//       if (waitResult.StatusCode !== 0) {
//         return {
//           output:
//             output || `Container exited with code ${waitResult.StatusCode}`,
//           status: "ERROR",
//         };
//       }

//       if (!output.trim()) {
//         return {
//           output: "Container executed but produced no output",
//           status: "ERROR",
//         };
//       }

//       return this.processOutput(output);
//     } catch (error: any) {
//       return {
//         output:
//           error === "TLE"
//             ? "Time Limit Exceeded"
//             : error.message || String(error),
//         status: "ERROR",
//       };
//     } finally {
//       // Cleanup
//       if (pythonDockerContainer) {
//         await pythonDockerContainer.kill().catch(() => {});
//         await pythonDockerContainer.remove({ force: true }).catch(() => {});
//       }
//       if (tempDir) {
//         await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
//       }
//     }
//   }

//   private processOutput(output: string): ExecutionResponse {
//     try {
//       const cleanOutput = output.replace(/[\x00-\x1F\x7F]/g, "").trim();

//       try {
//         const results = JSON.parse(cleanOutput);

//         if (Array.isArray(results)) {
//           return {
//             output: cleanOutput,
//             status: results.every((result: any) => result.status === "PASSED")
//               ? "SUCCESS"
//               : "FAILED",
//           };
//         } else {
//           return {
//             output: `Expected an array of test results, but got: ${cleanOutput}`,
//             status: "ERROR",
//           };
//         }
//       } catch (jsonError) {
//         return {
//           output: `Error parsing results: ${cleanOutput}`,
//           status: "ERROR",
//         };
//       }
//     } catch (error: any) {
//       return {
//         output: `Error processing output: ${error.message || String(error)}`,
//         status: "ERROR",
//       };
//     }
//   }
// }
