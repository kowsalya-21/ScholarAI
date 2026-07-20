import mongoose from 'mongoose';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const adminSchema = new mongoose.Schema(
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
    role: {
      type: String,
      enum: {
        values: ['Admin'],
        message: 'Role must be Admin',
      },
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Check if model is already registered before exporting to avoid Mongoose compilation errors during hot-reload
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

export default Admin;
