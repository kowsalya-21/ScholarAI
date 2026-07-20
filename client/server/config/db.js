import mongoose from 'mongoose';

/**
 * Connect to MongoDB Database with connection retries and robust logging
 */
const connectDB = async (retryCount = 0) => {
  const maxRetries = 5;
  const retryIntervalMs = 5000;

  let mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('CRITICAL ERROR: MONGODB_URI is not defined in the environment variables.');
    process.exit(1);
  }

  // Setup connection event listeners only on the first attempt
  if (retryCount === 0) {
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
    console.log(`Connecting to MongoDB... (Attempt ${retryCount + 1}/${maxRetries})`);
    
    const options = {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    };

    const conn = await mongoose.connect(mongoURI, options);
    console.log(`Mongoose: MongoDB connection established. Database: "${conn.connection.name}"`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection attempt ${retryCount + 1} failed: ${error.message}`);
    
    // If SRV DNS lookup failed (querySrv ECONNREFUSED), convert to direct cluster hosts fallback
    if (error.message.includes('querySrv') && mongoURI.startsWith('mongodb+srv://')) {
      console.log('SRV DNS lookup failed. Attempting direct cluster hosts fallback...');
      const fallbackURI = 'mongodb://kowsalyanadisetti_db_user:kowsalya@ac-uqubk4r-shard-00-00.buwqrdd.mongodb.net:27017,ac-uqubk4r-shard-00-01.buwqrdd.mongodb.net:27017,ac-uqubk4r-shard-00-02.buwqrdd.mongodb.net:27017/scholarai?ssl=true&authSource=admin';
      process.env.MONGODB_URI = fallbackURI;
      return connectDB(retryCount);
    }

    if (retryCount < maxRetries - 1) {
      console.log(`Retrying connection in ${retryIntervalMs / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
      return connectDB(retryCount + 1);
    } else {
      console.error('CRITICAL ERROR: Max MongoDB connection retries reached. Shutting down server...');
      process.exit(1);
    }
  }
};

export default connectDB;


