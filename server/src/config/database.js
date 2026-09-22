import mongoose from "mongoose";

import { env } from "./env.js";

mongoose.set("strictQuery", true);

export const getDatabaseState = () => mongoose.connection.readyState;

export const connectDatabase = async (uri = env.MONGODB_URI) => {
  if (!uri) throw new Error("MONGODB_URI is not configured. Set it in server/.env");
  if (mongoose.connection.readyState === 1) return mongoose;

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const { host, port, name } = mongoose.connection;
  console.info(`[db] MongoDB connected -> ${host}:${port}/${name}`);
  return mongoose;
};

export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.info("[db] MongoDB connection closed");
  }
};

export default connectDatabase;
