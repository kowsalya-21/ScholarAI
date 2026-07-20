import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new student
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res, next) => {
  // 1. Process validation results from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const {
    fullName,
    email,
    password,
    phone,
    college,
    course,
    year,
    cgpa,
    familyIncome,
    category,
    gender,
    state,
    skills,
  } = req.body;

  // 2. Prevent duplicate registrations
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return next(new AppError('A user with this email address already exists.', 400));
  }

  // 3. Hash password using bcryptjs
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Sanitize input values to prevent validation crashes from empty string values in optional enums
  const cleanPhone = phone === '' ? undefined : phone;
  const cleanCollege = college === '' ? undefined : college;
  const cleanCourse = course === '' ? undefined : course;
  const cleanYear = year === '' ? undefined : year;
  const cleanCgpa = (cgpa === null || cgpa === '' || isNaN(parseFloat(cgpa))) ? undefined : parseFloat(cgpa);
  const cleanFamilyIncome = (familyIncome === null || familyIncome === '' || isNaN(parseInt(familyIncome))) ? undefined : parseInt(familyIncome);
  const cleanCategory = category === '' ? undefined : category;
  const cleanGender = gender === '' ? undefined : gender;
  const cleanState = state === '' ? undefined : state;

  // 4. Create student user account
  const newUser = await User.create({
    fullName,
    email,
    password: hashedPassword,
    phone: cleanPhone,
    college: cleanCollege,
    course: cleanCourse,
    year: cleanYear,
    cgpa: cleanCgpa,
    familyIncome: cleanFamilyIncome,
    category: cleanCategory,
    gender: cleanGender,
    state: cleanState,
    skills: Array.isArray(skills) ? skills : [],
    role: 'Student', // Force Student role on registration
  });

  // Remove password field from output
  newUser.password = undefined;

  // 6. Return response
  res.status(201).json({
    success: true,
    message: 'User registered successfully!',
    user: newUser,
  });
});

/**
 * @desc    Log in user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
  // 1. Process validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  // 2. Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Invalid email or password.', 401));
  }

  // 3. Check if user is active
  if (!user.isActive) {
    return next(new AppError('This user account has been deactivated.', 401));
  }

  // 4. Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password.', 401));
  }

  // Remove password from response
  user.password = undefined;

  // 5. Generate token
  const token = generateToken(user._id);

  // 6. Return response
  res.status(200).json({
    success: true,
    token,
    user,
  });
});

/**
 * @desc    Get currently logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

/**
 * @desc    Generate password reset OTP and print to console
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No account found with this email.', 404));
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and save with 10-minute expiry
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  user.resetOTP = hashedOtp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000;
  user.otpAttempts = 0;

  await user.save({ validateBeforeSave: false });

  // Print OTP to backend terminal
  console.log('\n=================================================');
  console.log('ScholarAI Password Reset OTP');
  console.log(`Email: ${email}`);
  console.log(`OTP: ${otp}`);
  console.log('Expires In: 10 Minutes');
  console.log('=================================================\n');

  res.status(200).json({
    success: true,
    message: 'OTP generated successfully.',
  });
});

/**
 * @desc    Verify OTP code
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Email not found.', 404));
  }

  // Check expiry
  if (!user.otpExpiry || user.otpExpiry < Date.now()) {
    return next(new AppError('OTP Expired', 400));
  }

  // Check attempts
  if (user.otpAttempts >= 5) {
    return next(new AppError('Invalid OTP', 400));
  }

  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  if (user.resetOTP !== hashedOtp) {
    user.otpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Invalid OTP', 400));
  }

  res.status(200).json({
    success: true,
  });
});

/**
 * @desc    Reset password using OTP code
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { email, otp, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return next(new AppError('Passwords do not match.', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Email not found.', 404));
  }

  // Check expiry
  if (!user.otpExpiry || user.otpExpiry < Date.now()) {
    return next(new AppError('OTP Expired', 400));
  }

  // Check attempts
  if (user.otpAttempts >= 5) {
    return next(new AppError('Invalid OTP', 400));
  }

  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  if (user.resetOTP !== hashedOtp) {
    user.otpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Invalid OTP', 400));
  }

  // Update password and clear OTP fields
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.resetOTP = undefined;
  user.otpExpiry = undefined;
  user.otpAttempts = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully.',
  });
});
