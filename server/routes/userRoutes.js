import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Scholarship from '../models/Scholarship.js';
import Application from '../models/Application.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * @route   PUT /api/users/profile
 * @desc    Update current logged-in user profile
 * @access  Private (Requires Bearer token)
 */
router.put('/profile', protect, asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User account not found.'
    });
  }

  // Define allowed fields to prevent arbitrary role modifications or deactivations
  const allowedFields = [
    'fullName', 'email', 'phone', 'college', 'course', 'year',
    'cgpa', 'familyIncome', 'category', 'gender', 'state', 'skills'
  ];

  // Update schema values
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  // Verify email uniqueness if email is changed
  if (req.body.email && req.body.email.toLowerCase() !== req.user.email.toLowerCase()) {
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }
  }

  const updatedUser = await user.save();
  
  // Exclude password in response
  updatedUser.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully!',
    user: updatedUser
  });
}));

const mapCourseToEducationLevel = (course) => {
  if (!course) return 'All';
  const c = course.toLowerCase();
  if (c.includes('b.tech') || c.includes('b.e.') || c.includes('b.sc') || c.includes('b.a.') || c.includes('b.com') || c.includes('bba') || c.includes('bca') || c.includes('undergraduate')) {
    return 'Undergraduate';
  }
  if (c.includes('m.tech') || c.includes('m.e.') || c.includes('m.sc') || c.includes('m.a.') || c.includes('m.com') || c.includes('mba') || c.includes('mca') || c.includes('postgraduate') || c.includes('post graduate')) {
    return 'Postgraduate';
  }
  if (c.includes('ph.d') || c.includes('phd') || c.includes('doctor')) {
    return 'PhD';
  }
  if (c.includes('diploma')) {
    return 'Diploma';
  }
  return 'All';
};

const getMatchingScholarshipsQuery = (user) => {
  const query = { status: 'Open' };
  const andConditions = [];

  if (user.state) {
    andConditions.push({
      $or: [
        { state: 'All' },
        { state: { $regex: new RegExp(`^${user.state}$`, 'i') } }
      ]
    });
  }

  if (user.category) {
    andConditions.push({
      $or: [
        { category: 'All' },
        { category: { $regex: new RegExp(`^${user.category}$`, 'i') } }
      ]
    });
  }

  if (user.cgpa !== undefined && user.cgpa !== null) {
    andConditions.push({
      minimumCGPA: { $lte: user.cgpa }
    });
  }

  if (user.familyIncome !== undefined && user.familyIncome !== null) {
    andConditions.push({
      $or: [
        { maximumIncome: { $gte: user.familyIncome } },
        { maximumIncome: { $exists: false } },
        { maximumIncome: null }
      ]
    });
  }

  const eduLevel = mapCourseToEducationLevel(user.course);
  if (eduLevel !== 'All') {
    andConditions.push({
      $or: [
        { educationLevel: 'All' },
        { educationLevel: eduLevel }
      ]
    });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  return query;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Applied':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'Under Review':
    case 'Shortlisted':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'Selected':
    case 'Approved':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'Rejected':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    default:
      return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  }
};

const getDashboardStats = async (user) => {
  const userId = user._id;

  const savedCount = await Application.countDocuments({
    student: userId,
    status: 'Interested'
  });

  const appliedCount = await Application.countDocuments({
    student: userId,
    status: { $ne: 'Interested' }
  });

  const now = new Date();
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  const upcomingCount = await Scholarship.countDocuments({
    status: 'Open',
    applicationDeadline: {
      $gte: now,
      $lte: thirtyDaysLater
    }
  });

  const matchQuery = getMatchingScholarshipsQuery(user);
  const recommendedCount = await Scholarship.countDocuments(matchQuery);

  const fields = [
    'fullName', 'email', 'phone', 'college', 'course', 'year',
    'cgpa', 'familyIncome', 'category', 'gender', 'state'
  ];
  let filledCount = 0;
  fields.forEach(field => {
    if (user[field] !== undefined && user[field] !== null && user[field] !== '') {
      filledCount++;
    }
  });
  if (user.skills && user.skills.length > 0) {
    filledCount++;
  }
  const profileCompleteness = (filledCount / (fields.length + 1)) * 100;

  const matchingScholarships = await Scholarship.find(matchQuery).limit(10);
  let averageMatchScore = 70;
  if (matchingScholarships.length > 0) {
    let totalScore = 0;
    matchingScholarships.forEach(sch => {
      let score = 75;
      if (user.cgpa && sch.minimumCGPA) {
        const diff = user.cgpa - sch.minimumCGPA;
        score += Math.min(15, Math.max(0, diff * 10));
      }
      if (user.familyIncome && sch.maximumIncome) {
        const ratio = user.familyIncome / sch.maximumIncome;
        if (ratio < 0.5) score += 10;
      }
      if (sch.state && sch.state !== 'All') score += 5;
      if (sch.category && sch.category !== 'All') score += 5;
      totalScore += Math.min(99, score);
    });
    averageMatchScore = totalScore / matchingScholarships.length;
  }
  const matchingStrength = (profileCompleteness * 0.4) + (averageMatchScore * 0.6);

  const recommendedList = await Scholarship.find(matchQuery)
    .sort({ applicationDeadline: 1 })
    .limit(6);

  const dbApplications = await Application.find({ student: userId, status: { $ne: 'Interested' } })
    .populate('scholarship')
    .sort({ updatedAt: -1 })
    .limit(5);

  const recentApplications = dbApplications.map(app => {
    if (!app.scholarship) return null;
    return {
      id: app._id,
      scholarship: app.scholarship.title,
      status: app.status,
      appliedDate: app.appliedAt ? app.appliedAt.toISOString().split('T')[0] : app.createdAt.toISOString().split('T')[0],
      statusColor: getStatusColor(app.status)
    };
  }).filter(item => item !== null);

  const dbUpcoming = await Scholarship.find({
    status: 'Open',
    applicationDeadline: { $gte: now, $lte: thirtyDaysLater }
  })
    .sort({ applicationDeadline: 1 })
    .limit(3);

  const upcomingDeadlines = dbUpcoming.map(sch => {
    const diffTime = new Date(sch.applicationDeadline) - now;
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return {
      id: sch._id,
      title: sch.title,
      date: sch.applicationDeadline.toISOString().split('T')[0],
      status: daysLeft <= 15 ? 'Urgent' : 'Upcoming',
      daysLeft,
      color: daysLeft <= 15 ? 'border-rose-500 bg-rose-500/10 text-rose-600' : 'border-amber-500 bg-amber-500/10 text-amber-600'
    };
  });

  return {
    recommendedCount,
    savedCount,
    appliedCount,
    upcomingCount,
    matchingStrength: parseFloat(matchingStrength.toFixed(1)),
    recommendedList,
    recentApplications,
    upcomingDeadlines
  };
};

/**
 * @route   POST /api/users/dashboard/sync
 * @desc    Sync local storage data to DB and retrieve updated stats/recommendations
 * @access  Private (Requires Bearer token)
 */
router.post('/dashboard/sync', protect, asyncHandler(async (req, res, next) => {
  const { savedIds = [], applications = [] } = req.body;
  const userId = req.user._id;

  // Re-build student applications from frontend state
  await Application.deleteMany({ student: userId });

  // Map saved/bookmarked scholarships
  const savedRecords = savedIds.map(schId => ({
    student: userId,
    scholarship: schId,
    status: 'Interested'
  }));

  // Map submitted applications by matching scholarship title
  const appRecords = [];
  for (const app of applications) {
    const sch = await Scholarship.findOne({ title: app.scholarshipName });
    if (sch) {
      appRecords.push({
        student: userId,
        scholarship: sch._id,
        status: app.status,
        appliedAt: app.appliedDate ? new Date(app.appliedDate) : new Date()
      });
    }
  }

  const allRecords = [...savedRecords, ...appRecords];
  if (allRecords.length > 0) {
    // Deduplicate records to avoid unique constraint issues
    const uniqueRecordsMap = new Map();
    allRecords.forEach(rec => {
      const key = `${rec.student.toString()}_${rec.scholarship.toString()}`;
      if (uniqueRecordsMap.has(key)) {
        if (rec.status !== 'Interested') {
          uniqueRecordsMap.set(key, rec);
        }
      } else {
        uniqueRecordsMap.set(key, rec);
      }
    });

    const uniqueRecords = Array.from(uniqueRecordsMap.values());
    await Application.insertMany(uniqueRecords);
  }

  const dbStats = await getDashboardStats(req.user);

  res.status(200).json({
    success: true,
    data: dbStats
  });
}));

/**
 * @route   GET /api/users/dashboard
 * @desc    Retrieve dashboard stats and recommended scholarships
 * @access  Private (Requires Bearer token)
 */
router.get('/dashboard', protect, asyncHandler(async (req, res, next) => {
  const dbStats = await getDashboardStats(req.user);
  res.status(200).json({
    success: true,
    data: dbStats
  });
}));

export default router;
