import Redis from "ioredis";
import config from "./server.config.js";

const redisConfig = {
  port: Number(config.REDIS_PORT),
  host: config.REDIS_HOST,
  maxRetriesPerRequest: null,
};

const redisConnection = new Redis(redisConfig);

export default redisConnection;
