import Docker from "dockerode";

const docker = new Docker();

/**
 * Creates a Docker container with the specified image and command
 *
 * @param image Docker image to use
 * @param command Command to run in the container
 * @param options Additional container creation options
 * @returns Docker container instance
 */
export default async function createContainer(
  image: string,
  command: string[],
  options: any = {},
): Promise<Docker.Container> {
  // Default configuration
  const containerConfig = {
    Image: image,
    Cmd: command,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
    StopTimeout: 15, // 15 seconds timeout for stopping
    HostConfig: {
      Memory: 256 * 1024 * 1024, // 256MB memory limit
      MemorySwap: 256 * 1024 * 1024, // No swap
      CpuPeriod: 100000,
      CpuQuota: 50000, // 50% CPU limit
      AutoRemove: false,
      NetworkMode: "none", // Disable network access
      ...options.HostConfig,
    },
    NetworkDisabled: true, // Disable network
    OpenStdin: true,
    StdinOnce: true,
  };

  // Merge with provided options
  if (options.Binds) {
    containerConfig.HostConfig.Binds = options.Binds;
  }

  try {
    return await docker.createContainer(containerConfig);
  } catch (error) {
    console.error(`Failed to create container with image ${image}:`, error);
    throw error;
  }
}
