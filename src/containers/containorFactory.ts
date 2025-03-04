import Docker from "dockerode";

export default async function createContainer(
  imageName: string,
  cmdExecutable: string[],
) {
  const docker = new Docker();

  const container = await docker.createContainer({
    Image: imageName,
    Cmd: cmdExecutable,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
    HostConfig: {
      Memory: 2 * 1024 * 1024 * 1024, // 2GB
      AutoRemove: true,
    },
    OpenStdin: true,
  });

  return container;
}
