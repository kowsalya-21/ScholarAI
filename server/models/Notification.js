import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required for notifications'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: [
        'Scholarship Recommendation',
        'New Scholarship',
        'Application Status',
        'Deadline Reminder',
        'Profile Update',
        'System Notification'
      ],
      default: 'System Notification'
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for querying unread/read messages for a user quickly
notificationSchema.index({ user: 1, isRead: 1 });

// Check if model is already registered before exporting to avoid Mongoose compilation errors during hot-reload
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
