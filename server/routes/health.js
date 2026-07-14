import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Check API and database status
 * @access  Public
 */
router.get('/health', (req, res) => {
  // mongoose.connection.readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const isDbConnected = mongoose.connection.readyState === 1;
  
  res.status(200).json({
    status: 'OK',
    database: isDbConnected ? 'Connected' : 'Disconnected',
  });
});

export default router;
