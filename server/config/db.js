import mongoose from 'mongoose';

/**
 * Connect to MongoDB Database with connection retries and robust logging
 */
const connectDB = async (retryCount = 0) => {
  const maxRetries = 5;
  const retryIntervalMs = 5000;

  const mongoURI = process.env.MONGODB_URI;

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
      autoIndex: true, // Build indexes (useful in dev, but can disable in production for performance)
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
      console.error('CRITICAL ERROR: Max MongoDB connection retries reached. Shutting down server...');
      process.exit(1);
    }
  }
};

export default connectDB;

