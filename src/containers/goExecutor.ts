// import { GO_IMAGE } from "../utils/constants.js";
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

// export default class GoExecutor implements CodeExecutorStrategy {
//   async execute(
//     code: string,
//     testCases: TestCase[],
//   ): Promise<ExecutionResponse> {
//     console.log(testCases);
//     let tempDir = "";
//     let goDockerContainer = null;

//     try {
//       await pullImage(GO_IMAGE);
//       tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "go-execution-"));

//       // Create Go module structure
//       await fs.mkdir(path.join(tempDir, "src"), { recursive: true });
//       await fs.writeFile(path.join(tempDir, "src", "main.go"), code, {
//         encoding: "utf8",
//       });
//       await fs.writeFile(
//         path.join(tempDir, "go.mod"),
//         "module solution\n\ngo 1.20\n",
//         { encoding: "utf8" },
//       );

//       // Commands and container options
//       const runCommand = "cd /code && go run src/main.go";

//       const containerOptions: ContainerCreateOptions = {
//         Image: GO_IMAGE,
//         Cmd: ["/bin/sh", "-c", runCommand],
//         HostConfig: {
//           Binds: [`${tempDir}:/code`],
//           Memory: 512 * 1024 * 1024,
//           MemorySwap: 512 * 1024 * 1024,
//           CpuPeriod: 100000,
//           CpuQuota: 75000,
//           Tmpfs: { "/tmp": "rw,noexec,nosuid,size=1g" },
//         },
//       };

//       // Create, start container and get output
//       goDockerContainer = await createContainer(
//         GO_IMAGE,
//         containerOptions.Cmd!,
//         containerOptions,
//       );
//       await goDockerContainer.start();

//       const logStream = await goDockerContainer.logs({
//         follow: true,
//         stdout: true,
//         stderr: true,
//       });
//       const rawLogBuffer: Buffer[] = [];
//       logStream.on("data", (chunk: Buffer) => rawLogBuffer.push(chunk));

//       const output = await fetchDecodeStream(logStream, rawLogBuffer);

//       const waitResult = await goDockerContainer.wait();
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
//       if (goDockerContainer) {
//         await goDockerContainer.kill().catch(() => {});
//         await goDockerContainer.remove({ force: true }).catch(() => {});
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
