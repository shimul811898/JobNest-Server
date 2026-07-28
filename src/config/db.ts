import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

const connectDB = async (): Promise<void> => {
  // Return early if already connected to MongoDB
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const dbUrl = process.env.MONGODB_URI;

  // Try Atlas / remote connection first
  if (dbUrl && !dbUrl.includes('127.0.0.1') && !dbUrl.includes('localhost')) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 10000 });
      console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn('Atlas connection failed:', (error as Error).message);
      if (process.env.VERCEL) {
        throw error;
      }
    }
  }

  // Fallback: spin up in-memory MongoDB (Local development only)
  if (!process.env.VERCEL) {
    try {
      console.log('Starting in-memory MongoDB server...');
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      console.log(`In-memory MongoDB started: ${memUri}`);
      const conn = await mongoose.connect(memUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  } else {
    throw new Error('MONGODB_URI environment variable is required on Vercel.');
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};

export default connectDB;
