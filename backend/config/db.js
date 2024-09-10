import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    mongoose.connect(MONGO_URI);
    console.log('MongoDB connected with Mongoose');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
};

export { connectDB };

