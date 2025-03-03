process.loadEnvFile();

export default {
  PORT: process.env.PORT || 4000,
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
};
