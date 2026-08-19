import mongoose from "mongoose";

/**
 * Connects to MongoDB using the MONGODB_URI environment variable.
 * If local MongoDB is not running, falls back to MongoMemoryServer automatically.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`⚠️ Local MongoDB unavailable (${error.message}). Starting In-Memory MongoDB...`);
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ In-Memory MongoDB connected: ${conn.connection.host}`);
    } catch (memError) {
      console.error(`❌ MongoDB connection error: ${memError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
