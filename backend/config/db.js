import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/E_commerce_application';
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected with Mongoose');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
};

export { connectDB };

