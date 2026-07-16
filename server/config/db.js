import mongoose from 'mongoose';

/**
 * Connect to MongoDB Database
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('CRITICAL ERROR: MONGODB_URI is not defined in the environment variables.');
      process.exit(1);
    }

    // Set connection options
    const options = {
      autoIndex: true, // Build indexes (useful in dev, but can disable in production for performance)
    };

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully to cluster.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection disconnected.');
    });

    // Attempt to connect
    const conn = await mongoose.connect(mongoURI, options);

    console.log(`MongoDB Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default connectDB;
