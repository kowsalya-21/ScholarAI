import mongoose from 'mongoose';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    phone: {
      type: String,
      trim: true,
    },
    college: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
      trim: true,
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10'],
    },
    familyIncome: {
      type: Number,
      min: [0, 'Family income cannot be negative'],
    },
    category: {
      type: String,
      enum: {
        values: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'],
        message: 'Category must be General, OBC, SC, ST, EWS, or Other',
      },
      default: 'General',
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Other', 'Prefer not to say'],
        message: 'Gender must be Male, Female, Other, or Prefer not to say',
      },
    },
    state: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    profileImage: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ['Student', 'Admin'],
        message: 'Role must be Student or Admin',
      },
      default: 'Student',
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetOTP: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    otpAttempts: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Check if model is already registered before exporting to avoid Mongoose compilation errors during hot-reload
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
