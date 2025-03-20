import decodeDockerStream from "./decodeDockerStream.js";

const fetchDecodedStream = (
  loggerStream: NodeJS.ReadableStream,
  rawLogBuffer: Buffer[],
  timeLimit: number,
): Promise<string> => {
  return new Promise((res, rej) => {
    const timeOut = setTimeout(() => {
      console.log("Time out called");
      rej("TLE");
    }, timeLimit);
    loggerStream.on("end", () => {
      clearTimeout(timeOut);
      const completeBuffer = Buffer.concat(rawLogBuffer);
      const decodedStream = decodeDockerStream(completeBuffer);
      if (decodedStream.stdout) {
        res(decodedStream.stdout);
      } else {
        rej(decodedStream.stderr);
      }
    });
  });
};

export default fetchDecodedStream;
