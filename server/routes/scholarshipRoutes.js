import express from 'express';
import { body } from 'express-validator';
import { 
  getAllScholarships, 
  getScholarshipById, 
  createScholarship, 
  updateScholarship, 
  deleteScholarship 
} from '../controllers/scholarshipController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation chains for write operations
const scholarshipValidation = [
  body('title')
    .notEmpty()
    .withMessage('Scholarship title is required')
    .trim(),
  body('provider')
    .notEmpty()
    .withMessage('Scholarship provider is required')
    .trim(),
  body('description')
    .notEmpty()
    .withMessage('Scholarship description is required'),
  body('scholarshipAmount')
    .isNumeric()
    .withMessage('Scholarship amount must be a number')
    .custom((val) => parseFloat(val) >= 0)
    .withMessage('Scholarship amount cannot be negative'),
  body('applicationDeadline')
    .notEmpty()
    .withMessage('Application deadline date is required')
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 date (YYYY-MM-DD)'),
  body('applicationLink')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid application link URL'),
];

// Public GET routes
router.get('/', getAllScholarships);
router.get('/:id', getScholarshipById);

// Protected POST, PUT, DELETE routes (Require login)
router.post('/', protect, scholarshipValidation, createScholarship);
router.put('/:id', protect, scholarshipValidation, updateScholarship);
router.delete('/:id', protect, deleteScholarship);

export default router;
