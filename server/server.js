import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

// Handle uncaught exceptions globally (programming errors, syntax, sync errors)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down server...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Configure environment variables
dotenv.config();

// Connect to Database
connectDB();

// Define server port
const PORT = process.env.PORT || 5000;

// Start server listening
const server = app.listen(PORT, () => {
  console.log(`============================================`);
  console.log(` ScholarAI Backend Server Running!`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Port: ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`============================================`);
});

// Handle unhandled promise rejections (async errors)
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...');
  console.error(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful shutdown on SIGTERM (e.g., from Heroku/Docker)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully.');
  if (server) {
    server.close(() => {
      console.log('💥 Process terminated.');
    });
  }
});
