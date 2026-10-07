import Redis from "ioredis";
import logger from "../utils/logger.js";

// Configured for graceful fallback as requested.
// If Redis isn't available, we don't crash. We just disable caching.
const redisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  // Only try to connect a few times, then give up so the API isn't blocked forever
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) {
      logger.warn("Redis connection failed. Falling back to MongoDB only.", {
        event: "redis_fallback",
      });
      return null; // Stop retrying
    }
    return Math.min(times * 100, 3000); // Reconnect after small delay
  },
};

const redis = new Redis(redisOptions);

redis.on("connect", () => {
  logger.info("Redis connected successfully.", { event: "redis_connected" });
});

redis.on("error", (err) => {
  // We log this as a warning because the app is designed to gracefully degrade
  // if Redis is missing (e.g. running locally without Docker).
  logger.warn(`Redis error: ${err.message}`, { event: "redis_error" });
});

export default redis;

/**
 * Helper to safely get from cache without crashing if Redis is down
 */
export const getCache = async (key) => {
  if (redis.status !== "ready") return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error("Redis GET error", { event: "redis_get_error", error: error.message });
    return null;
  }
};

/**
 * Helper to safely set cache without crashing if Redis is down
 */
export const setCache = async (key, value, ttlSeconds = 300) => {
  if (redis.status !== "ready") return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    logger.error("Redis SET error", { event: "redis_set_error", error: error.message });
  }
};

/**
 * Helper to invalidate cache matching a pattern (e.g. after a new item is added)
 */
export const invalidateCache = async (pattern) => {
  if (redis.status !== "ready") return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
      logger.debug(`Invalidated ${keys.length} cache keys matching ${pattern}`, {
        event: "redis_invalidate",
        pattern,
      });
    }
  } catch (error) {
    logger.error("Redis INVALIDATE error", { event: "redis_invalidate_error", error: error.message });
  }
};
