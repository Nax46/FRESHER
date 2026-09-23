import mongoose from 'mongoose';
import { ENV } from './env.js';
import { logger } from './pino.js';

export const connectDB = async (): Promise<boolean> => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(ENV.MONGO_URI, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    logger.info(`MongoDB connected to: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection failure. Operating in-memory cache mode.');
    return false;
  }
};
