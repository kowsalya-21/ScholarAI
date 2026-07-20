import mongoose from 'mongoose';

const DEFAULT_FALLBACK_URI = 'mongodb://kowsalyanadisetti_db_user:kowsalya@ac-uqubk4r-shard-00-00.buwqrdd.mongodb.net:27017,ac-uqubk4r-shard-00-01.buwqrdd.mongodb.net:27017,ac-uqubk4r-shard-00-02.buwqrdd.mongodb.net:27017/scholarai?ssl=true&authSource=admin';

/**
 * Connect to MongoDB Database with connection retries and robust logging
 */
const connectDB = async (retryCount = 0) => {
  const maxRetries = 3;
  const retryIntervalMs = 1000;

  let mongoURI = process.env.MONGODB_URI || DEFAULT_FALLBACK_URI;
  if (mongoURI.includes('mongodb+srv://')) {
    mongoURI = DEFAULT_FALLBACK_URI;
  }

  // Setup connection event listeners only on the first attempt
  if (retryCount === 0) {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    mongoose.connection.on('connected', () => {
      console.log('Mongoose: MongoDB connected successfully to cluster.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`Mongoose: MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose: MongoDB connection disconnected.');
    });
  }

  try {
    console.log(`Connecting to MongoDB Atlas... (Attempt ${retryCount + 1}/${maxRetries})`);
    
    const options = {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    };

    const conn = await mongoose.connect(mongoURI, options);
    console.log(`Mongoose: MongoDB connection established. Database: "${conn.connection.name}"`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection attempt ${retryCount + 1} failed: ${error.message}`);

    if (retryCount < maxRetries - 1) {
      console.log(`Retrying connection in ${retryIntervalMs / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
      return connectDB(retryCount + 1);
    } else {
      console.error('ERROR: Max MongoDB connection retries reached.');
      throw error;
    }
  }
};

export default connectDB;
