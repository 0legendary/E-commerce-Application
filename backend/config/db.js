import { MongoClient } from 'mongodb';
import Collections from '../model/collections.js'
import dotenv from 'dotenv';
dotenv.config();


const MONGO_URI = process.env.MONGO_URI
const DATABASE_NAME = process.env.DATABASE_NAME


let db;

const connectDB = async () => {
  try {
    const client = await MongoClient.connect(MONGO_URI);
    db = client.db(DATABASE_NAME);
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
};


const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

export { connectDB, getDB, Collections };
