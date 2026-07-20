import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, forgotPassword, verifyOtp, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Validation Chains
const registerValidation = [
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

const verifyOtpValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits'),
];

const resetPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required'),
];

// 2. Route mappings

/**
 * @route   POST /api/auth/register
 * @desc    Student account registration
 * @access  Public
 */
router.post('/register', registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and acquire token
 * @access  Public
 */
router.post('/login', loginValidation, login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate password reset OTP
 * @access  Public
 */
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify 6-digit OTP code
 * @access  Public
 */
router.post('/verify-otp', verifyOtpValidation, verifyOtp);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using OTP code
 * @access  Public
 */
router.post('/reset-password', resetPasswordValidation, resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Fetch profile info of current logged-in user
 * @access  Private (Requires Bearer token)
 */
router.get('/me', protect, getMe);

export default router;
