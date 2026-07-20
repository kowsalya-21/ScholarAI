let app;
let initError = null;

try {
  const express = (await import('express')).default;
  const cors = (await import('cors')).default;
  const helmet = (await import('helmet')).default;
  const morgan = (await import('morgan')).default;
  const cookieParser = (await import('cookie-parser')).default;

  const AppError = (await import('../server/utils/appError.js')).default;
  const globalErrorHandler = (await import('../server/middleware/errorMiddleware.js')).default;
  const healthRouter = (await import('../server/routes/health.js')).default;
  const authRouter = (await import('../server/routes/authRoutes.js')).default;
  const scholarshipRouter = (await import('../server/routes/scholarshipRoutes.js')).default;
  const userRouter = (await import('../server/routes/userRoutes.js')).default;
  const notificationRouter = (await import('../server/routes/notificationRoutes.js')).default;
  const connectDB = (await import('../server/config/db.js')).default;

  app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
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

  // Handle MongoDB Connection
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      console.error('DB Connection error:', err);
      res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
  });

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
} catch (err) {
  console.error('Initialization error in client/api/index.js:', err);
  initError = err;
}

export default async function handler(req, res) {
  if (initError) {
    return res.status(500).json({
      error: 'Initialization Failed',
      message: initError.message,
      stack: initError.stack
    });
  }
  try {
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      error: 'Handler Execution Failed',
      message: err.message,
      stack: err.stack
    });
  }
}
