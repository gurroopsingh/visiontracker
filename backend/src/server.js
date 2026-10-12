/**
 * server.js — VisionTracker Express application entry point.
 *
 * Bootstrap order:
 *   1. Load environment variables
 *   2. Create HTTP server (http.createServer — enables Socket.IO in Phase 2F)
 *   3. Apply global middleware (CORS, JSON, rate limiting, request logging)
 *   4. Mount API routes
 *   5. Set up EJS for the admin diagnostics page
 *   6. Register 404 + centralized error handler (must be last)
 *   7. Start listening
 *
 * Uses Node.js core modules:
 *   - http  → http.createServer wraps Express app (enables future Socket.IO)
 *   - path  → resolve EJS views directory path (ES module __dirname equivalent)
 *   - url   → fileURLToPath for ESM-compatible __dirname
 *   - os    → uptime display in the admin page
 */

import "dotenv/config";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimitMiddleware.js";
import logger from "./utils/logger.js";
import { initSocket } from "./config/socket.js";

// ESM-compatible __dirname (path + url core modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Express App ───────────────────────────────────────────────────────────────
const app = express();

// ── View Engine (EJS) — for the server-rendered /admin diagnostics page ───────
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Request Logging Middleware ─────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "debug";
    logger[level](`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      event: "http_request",
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip,
    });
  });
  next();
});

// ── Static Files (Uploads) ────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// ── Health Check (no rate limit — used by Docker health checks later) ─────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "VisionTracker API is running.",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── EJS Admin Diagnostics Page ────────────────────────────────────────────────
// Protected by a simple secret token. Set ADMIN_SECRET in .env.
// Access: GET /admin?secret=<ADMIN_SECRET>
app.get("/admin", (req, res) => {
  const secret = process.env.ADMIN_SECRET;
  if (secret && req.query.secret !== secret) {
    return res.status(403).send("403 Forbidden — Invalid admin secret.");
  }

  const dbStateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const uptimeSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  const { readyState, host, name } = mongoose.connection;

  res.render("admin", {
    appName: "VisionTracker",
    appVersion: "2.0.0",
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 5000,
    nodeVersion: process.version,
    platform: os.platform(),
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    memoryMB: (process.memoryUsage().rss / 1024 / 1024).toFixed(1),
    dbStatus: dbStateMap[readyState] || "unknown",
    dbHost: host || "—",
    dbName: name || "—",
    generatedAt: new Date().toLocaleString("en-IN"),
  });
});

// ── API Routes (with rate limiting) ──────────────────────────────────────────
// Auth routes get the stricter rate limiter
app.use("/api/auth", authLimiter, authRoutes);

// All other API routes get the general limiter
app.use("/api/items", apiLimiter, itemRoutes);

// ── 404 Handler for unmatched routes ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Centralized Error Handler ─────────────────────────────────────────────────
// Must be registered AFTER all routes
app.use(errorHandler);

// ── HTTP Server ───────────────────────────────────────────────────────────────
// Using http.createServer(app) instead of app.listen() so that
// Socket.IO can be attached to the same server in Phase 2F.
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(PORT, () => {
  logger.info(`VisionTracker API running on http://localhost:${PORT}`, {
    event: "server_start",
    port: PORT,
    environment: process.env.NODE_ENV || "development",
  });
});

// Export server for Socket.IO attachment in Phase 2F
export { app, server };
