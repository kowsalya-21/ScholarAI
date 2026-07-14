import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    scholarship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scholarship',
      required: [true, 'Scholarship reference is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Interested', 'Applied', 'Under Review', 'Selected', 'Rejected'],
        message: 'Status must be Interested, Applied, Under Review, Selected, or Rejected',
      },
      default: 'Interested',
      index: true,
    },
    appliedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique applications: A student can only apply/express interest in a scholarship once.
applicationSchema.index({ student: 1, scholarship: 1 }, { unique: true });

// Check if model is already registered before exporting to avoid Mongoose compilation errors during hot-reload
const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);

export default Application;
