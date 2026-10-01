/**
 * logger.js — Centralized structured logger using Winston.
 *
 * All backend modules should import and use this logger instead of
 * calling console.log/console.error directly. This gives us:
 *   - Consistent log format (timestamp + level + message)
 *   - Different transports per environment (console in dev, file in prod)
 *   - Easy log-level control via LOG_LEVEL environment variable
 *   - Colourised output in development for readability
 *
 * Usage:
 *   import logger from '../utils/logger.js';
 *   logger.info('Server started');
 *   logger.warn('Redis unavailable, falling back to MongoDB');
 *   logger.error('Auth failure', { userId, reason });
 */

import { createLogger, format, transports } from "winston";

const { combine, timestamp, colorize, printf, json, errors } = format;

// ── Log format for development (human-readable, colourised) ───────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
  })
);

// ── Log format for production (structured JSON, easy to ingest into log tools) ─
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const isDev = process.env.NODE_ENV !== "production";

const logger = createLogger({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  format: isDev ? devFormat : prodFormat,
  transports: [
    new transports.Console(),
  ],
  // Prevent Winston from exiting on uncaught exceptions; let the process handle it
  exitOnError: false,
});

export default logger;
