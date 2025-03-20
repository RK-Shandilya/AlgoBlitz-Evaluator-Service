import DockerStreamOutput from "../types/dockerStreamOutput.js";
import { DOCKER_STREAM_HEADER_SIZE } from "./constants.js";

const decodeDockerStream = (buffer: Buffer): DockerStreamOutput => {
  let offset = 0;

  const output: DockerStreamOutput = { stdout: "", stderr: "" };

  while (offset < buffer.length) {
    const typeOfStream = buffer[offset];
    const lengthOfValue = buffer.readUInt32BE(offset + 4);
    offset += DOCKER_STREAM_HEADER_SIZE;

    if (typeOfStream == 1) {
      output.stdout += buffer.toString("utf-8", offset, offset + lengthOfValue);
    } else if (typeOfStream == 2) {
      output.stderr += buffer.toString("utf-8", offset, offset + lengthOfValue);
    }

    offset += lengthOfValue;
  }

  return output;
};

export default decodeDockerStream;
