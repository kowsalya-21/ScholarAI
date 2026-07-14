import { validationResult } from 'express-validator';
import Scholarship from '../models/Scholarship.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get all scholarships with search, filter, sorting, and pagination
 * @route   GET /api/scholarships
 * @access  Public
 */
export const getAllScholarships = asyncHandler(async (req, res, next) => {
  const query = {};

  // 1. Search functionality by title, provider, category, state, or educationLevel
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { title: searchRegex },
      { provider: searchRegex },
      { category: searchRegex },
      { state: searchRegex },
      { educationLevel: searchRegex }
    ];
  }

  // Individual search matches
  if (req.query.title) {
    query.title = new RegExp(req.query.title, 'i');
  }
  if (req.query.provider) {
    query.provider = new RegExp(req.query.provider, 'i');
  }

  // 2. Filters
  if (req.query.category && req.query.category !== 'All') {
    if (req.query.category === 'Other') {
      query.category = { $in: ['Other', 'Minority', 'Girls', 'Differently Abled', 'All'] };
    } else {
      query.category = { $in: [req.query.category, 'All'] };
    }
  }
  if (req.query.state && req.query.state !== 'All') {
    query.state = req.query.state;
  }
  if (req.query.educationLevel && req.query.educationLevel !== 'All') {
    if (req.query.educationLevel === 'High School') {
      query.educationLevel = { $in: ['High School', '10th', 'Intermediate', 'Pre Matric', 'All'] };
    } else if (req.query.educationLevel === 'Undergraduate') {
      query.educationLevel = { $in: ['Undergraduate', 'B.Tech', 'Medical', 'Nursing', 'Law', 'Arts', 'Science', 'Commerce', 'Diploma', 'Polytechnic', 'ITI', 'All'] };
    } else if (req.query.educationLevel === 'Postgraduate') {
      query.educationLevel = { $in: ['Postgraduate', 'M.Tech', 'MBA', 'MCA', 'All'] };
    } else if (req.query.educationLevel === 'PhD') {
      query.educationLevel = { $in: ['PhD', 'All'] };
    } else if (req.query.educationLevel === 'Diploma') {
      query.educationLevel = { $in: ['Diploma', 'Polytechnic', 'ITI', 'All'] };
    } else {
      query.educationLevel = req.query.educationLevel;
    }
  }
  if (req.query.minimumCGPA) {
    query.minimumCGPA = { $lte: parseFloat(req.query.minimumCGPA) };
  }
  if (req.query.maximumIncome) {
    query.$or = [
      { maximumIncome: { $gte: parseFloat(req.query.maximumIncome) } },
      { maximumIncome: { $exists: false } },
      { maximumIncome: null }
    ];
  }

  // 3. Pagination Setup
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // 4. Sorting Setup
  let sortBy = { createdAt: -1 }; // default: newest
  if (req.query.sort) {
    if (req.query.sort === 'newest') {
      sortBy = { createdAt: -1 };
    } else if (req.query.sort === 'deadline') {
      sortBy = { applicationDeadline: 1 };
    } else if (req.query.sort === 'amount') {
      sortBy = { scholarshipAmount: -1 };
    }
  }

  // 5. Query execution
  const totalResults = await Scholarship.countDocuments(query);
  const totalPages = Math.ceil(totalResults / limit);

  const data = await Scholarship.find(query)
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: data.length,
    pagination: {
      page,
      limit,
      totalPages,
      totalResults,
    },
    data,
  });
});

/**
 * @desc    Get a single scholarship by ID
 * @route   GET /api/scholarships/:id
 * @access  Public
 */
export const getScholarshipById = asyncHandler(async (req, res, next) => {
  const scholarship = await Scholarship.findById(req.params.id);
  
  if (!scholarship) {
    return next(new AppError(`No scholarship found with ID ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: scholarship,
  });
});

/**
 * @desc    Create a new scholarship
 * @route   POST /api/scholarships
 * @access  Private (Admin or Authenticated users)
 */
export const createScholarship = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const newScholarship = await Scholarship.create(req.body);

  res.status(201).json({
    success: true,
    data: newScholarship,
  });
});

/**
 * @desc    Update a scholarship
 * @route   PUT /api/scholarships/:id
 * @access  Private (Admin or Authenticated users)
 */
export const updateScholarship = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const updatedScholarship = await Scholarship.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedScholarship) {
    return next(new AppError(`No scholarship found with ID ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: updatedScholarship,
  });
});

/**
 * @desc    Delete a scholarship
 * @route   DELETE /api/scholarships/:id
 * @access  Private (Admin or Authenticated users)
 */
export const deleteScholarship = asyncHandler(async (req, res, next) => {
  const deletedScholarship = await Scholarship.findByIdAndDelete(req.params.id);

  if (!deletedScholarship) {
    return next(new AppError(`No scholarship found with ID ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    message: 'Scholarship deleted successfully',
  });
});
