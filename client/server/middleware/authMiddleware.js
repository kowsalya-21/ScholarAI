import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Route protection middleware to authorize requests
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    // Optional cookie support fallback
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to gain access.', 401)
    );
  }

  // 2. Verify token signature and expiration
  // jwt.verify throws JsonWebTokenError / TokenExpiredError on failure,
  // which is handled globally by our error middleware.
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Check if user still exists in the database
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // 4. Check if the user is active
  if (!currentUser.isActive) {
    return next(
      new AppError('This user account has been deactivated.', 401)
    );
  }

  // Grant access and attach user object (excluding password for security)
  currentUser.password = undefined;
  req.user = currentUser;
  next();
});
