import { Server } from "socket.io";
import logger from "../utils/logger.js";

let io;

// In-memory mapping of userId to their active socketId
const userSocketMap = new Map();

/**
 * Initialize Socket.IO with the HTTP server
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust for production if necessary
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.debug(`New client connected: ${socket.id}`, { event: "socket_connect" });

    // Client emits this event when they log in or load the dashboard.
    // Always coerce to String so the map key is always a consistent type.
    socket.on("register", (userId) => {
      const uid = String(userId);
      userSocketMap.set(uid, socket.id);
      logger.debug(`User ${uid} registered to socket ${socket.id}`, {
        event: "socket_register",
        userId: uid,
        socketId: socket.id,
      });
    });

    socket.on("disconnect", () => {
      // Find and remove the disconnected socket from our map
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          logger.debug(`User ${userId} disconnected. Removed from socket map.`, {
            event: "socket_disconnect",
            userId,
          });
          break;
        }
      }
    });
  });

  return io;
};

/**
 * Emit an event to a specific user
 */
export const emitToUser = (userId, eventName, payload) => {
  if (!io) {
    logger.warn("[socket] emitToUser called before Socket.IO was initialised", { userId, eventName });
    return;
  }
  const uid = String(userId); // always a string for reliable Map lookup
  const socketId = userSocketMap.get(uid);
  if (socketId) {
    io.to(socketId).emit(eventName, payload);
    logger.debug(`[socket] Event '${eventName}' emitted to user ${uid} (socket ${socketId})`, {
      event: "socket_emit_user",
      userId: uid,
      eventName,
    });
  } else {
    logger.debug(`[socket] User ${uid} has no active socket — notification not delivered in real-time`, {
      event: "socket_emit_user_offline",
      userId: uid,
      eventName,
    });
  }
};
