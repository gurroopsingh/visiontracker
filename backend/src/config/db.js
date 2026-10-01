import mongoose from "mongoose";
import logger from "../utils/logger.js";

/**
 * Connects to MongoDB using the MONGODB_URI environment variable.
 * If local MongoDB is not running, falls back to MongoMemoryServer automatically.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`, {
      event: "db_connected",
      host: conn.connection.host,
      database: conn.connection.name,
    });
  } catch (error) {
    logger.warn(
      `Local MongoDB unavailable (${error.message}). Starting In-Memory MongoDB...`,
      { event: "db_fallback" }
    );
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      logger.info(`In-Memory MongoDB connected: ${conn.connection.host}`, {
        event: "db_connected_memory",
        host: conn.connection.host,
      });
    } catch (memError) {
      logger.error(`MongoDB connection failed: ${memError.message}`, {
        event: "db_connection_error",
      });
      process.exit(1);
    }
  }
};

export default connectDB;
