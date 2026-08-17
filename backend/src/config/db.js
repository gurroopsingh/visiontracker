import mongoose from "mongoose";

/**
 * Connects to MongoDB using the MONGODB_URI environment variable.
 * Exits the process if the connection fails so the server does not
 * start in a broken state.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
