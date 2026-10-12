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

    // Client emits this event when they log in or load the dashboard
    socket.on("register", (userId) => {
      userSocketMap.set(userId, socket.id);
      logger.debug(`User ${userId} registered to socket ${socket.id}`, {
        event: "socket_register",
        userId,
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
  if (!io) return;
  const socketId = userSocketMap.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(eventName, payload);
    logger.debug(`Event ${eventName} emitted to user ${userId}`, {
      event: "socket_emit_user",
      userId,
      eventName,
    });
  }
};
