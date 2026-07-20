import mongoose from 'mongoose';

const DEFAULT_FALLBACK_URI = 'mongodb://kowsalyanadisetti_db_user:kowsalya@ac-uqubk4r-shard-00-00.buwqrdd.mongodb.net:27017,ac-uqubk4r-shard-00-01.buwqrdd.mongodb.net:27017,ac-uqubk4r-shard-00-02.buwqrdd.mongodb.net:27017/scholarai?ssl=true&authSource=admin';

let cachedPromise = null;

/**
 * Serverless optimized MongoDB Connection handler
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    let mongoURI = process.env.MONGODB_URI || DEFAULT_FALLBACK_URI;
    if (mongoURI.includes('mongodb+srv://')) {
      mongoURI = DEFAULT_FALLBACK_URI;
    }

    const options = {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log('Establishing new MongoDB Atlas connection...');
    cachedPromise = mongoose.connect(mongoURI, options).then((conn) => {
      console.log(`Mongoose: MongoDB connection established. Database: "${conn.connection.name}"`);
      return conn;
    }).catch((err) => {
      cachedPromise = null;
      console.error('Mongoose connection error:', err);
      throw err;
    });
  }

  return cachedPromise;
};

export default connectDB;
