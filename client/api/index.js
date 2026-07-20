import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import AppError from '../server/utils/appError.js';
import globalErrorHandler from '../server/middleware/errorMiddleware.js';
import healthRouter from '../server/routes/health.js';
import authRouter from '../server/routes/authRoutes.js';
import scholarshipRouter from '../server/routes/scholarshipRoutes.js';
import userRouter from '../server/routes/userRoutes.js';
import notificationRouter from '../server/routes/notificationRoutes.js';
import connectDB from '../server/config/db.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(morgan('combined'));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ScholarAI Backend Running Successfully',
  });
});

// API Routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/scholarships', scholarshipRouter);
app.use('/api/users', userRouter);
app.use('/api/notifications', notificationRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

let isDbConnected = false;

export default async function handler(req, res) {
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
    } catch (err) {
      console.error('Database connection error in Vercel Serverless Function:', err);
    }
  }
  return app(req, res);
}
