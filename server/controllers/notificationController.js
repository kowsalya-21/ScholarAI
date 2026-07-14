import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

/**
 * @desc    Get all notifications for logged-in user (auto-seeds if empty)
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res, next) => {
  let notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });

  // Auto-seed demo notifications if the user has 0 notifications in the system
  if (notifications.length === 0) {
    const seedData = [
      {
        user: req.user._id,
        type: 'Scholarship Recommendation',
        title: 'New Recommendation Match',
        message: 'Your profile matches the Prime Minister Research Fellowship (PMRF) with a 92% fit score.',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15 mins ago
      },
      {
        user: req.user._id,
        type: 'New Scholarship',
        title: 'New Scholarship Published',
        message: 'Siemens Scholarship Program for engineering students is now accepting applications.',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        user: req.user._id,
        type: 'Application Status',
        title: 'Application Under Review',
        message: 'Your application for the Aditya Birla Scholarship has been moved to "Under Review".',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      },
      {
        user: req.user._id,
        type: 'Deadline Reminder',
        title: 'Upcoming Deadline Alert',
        message: 'The deadline for HDFC Badhte Kadam Scholarship is closing in 3 days. Complete your submission!',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36) // 1.5 days ago
      },
      {
        user: req.user._id,
        type: 'Profile Update',
        title: 'Profile Verification',
        message: 'Your updated GPA and course parameters have been verified successfully.',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
      },
      {
        user: req.user._id,
        type: 'System Notification',
        title: 'System Update Complete',
        message: 'ScholarAI platform has been updated to version 2.1.0 with real-time matching.',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 days ago
      }
    ];

    await Notification.insertMany(seedData);
    notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  }

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

/**
 * @desc    Mark a specific notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true, runValidators: true }
  );

  if (!notification) {
    return next(new AppError(`No notification found with ID ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

/**
 * @desc    Mark all unread notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

/**
 * @desc    Clear all notifications for user
 * @route   DELETE /api/notifications
 * @access  Private
 */
export const clearAllNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ user: req.user._id });

  res.status(200).json({
    success: true,
    message: 'All notifications cleared successfully'
  });
});
