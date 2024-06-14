// db.js
import { MongoClient } from 'mongodb';
import Collections from '../model/collections.js'

const MONGO_URI = 'mongodb://localhost:27017';
const DATABASE_NAME = 'app-management';

let db;

const connectDB = async () => {
  try {
    const client = await MongoClient.connect(MONGO_URI);
    db = client.db(DATABASE_NAME);
    console.log('Connected to MongoDB');
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
