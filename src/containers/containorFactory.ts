import Docker from "dockerode";

async function createContainer(imageName: string, cmdExecutable: string[]) {
  const docker = new Docker();

  const container = await docker.createContainer({
    Image: imageName,
    Cmd: cmdExecutable,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    OpenStdin: true,
    HostConfig: {
      Memory: 1024 * 1024 * 512,
    },
    Tty: false,
  });

  return container;
}

export default createContainer;
