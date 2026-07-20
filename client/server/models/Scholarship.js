import mongoose from 'mongoose';

const urlRegex = /^https?:\/\/[^\s$.?#].[^\s]*$/;

const scholarshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Scholarship title is required'],
      trim: true,
      index: true,
    },
    provider: {
      type: String,
      required: [true, 'Scholarship provider is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Scholarship description is required'],
    },
    scholarshipAmount: {
      type: Number,
      required: [true, 'Scholarship amount is required'],
      min: [0, 'Scholarship amount cannot be negative'],
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
      index: true,
    },
    applicationLink: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return urlRegex.test(v);
        },
        message: 'Please provide a valid application HTTP/HTTPS URL'
      }
    },
    state: {
      type: String,
      trim: true,
      default: 'All',
    },
    category: {
      type: String,
      trim: true,
      default: 'All',
    },
    educationLevel: {
      type: String,
      default: 'All',
    },
    minimumCGPA: {
      type: Number,
      min: [0, 'Minimum CGPA cannot be negative'],
      max: [10, 'Minimum CGPA cannot exceed 10'],
      default: 0,
    },
    maximumIncome: {
      type: Number,
      min: [0, 'Maximum income limit cannot be negative'],
    },
    requiredDocuments: {
      type: [String],
      default: [],
    },
    eligibilityCriteria: {
      type: String,
    },
    eligibility: {
      type: String,
    },
    amount: {
      type: Number,
      min: [0, 'Scholarship amount cannot be negative'],
    },
    deadline: {
      type: Date,
    },
    officialWebsite: {
      type: String,
      trim: true,
    },
    applicationUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return urlRegex.test(v);
        },
        message: 'Please provide a valid application HTTP/HTTPS URL'
      }
    },
    stateEligibility: {
      type: String,
      trim: true,
    },
    applicationMode: {
      type: String,
      trim: true,
      default: 'Online',
    },
    benefits: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'Closed'],
        message: 'Status must be Open or Closed',
      },
      default: 'Open',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to synchronize new and old fields before validation
scholarshipSchema.pre('validate', function(next) {
  if (this.amount !== undefined && this.amount !== null) {
    this.scholarshipAmount = this.amount;
  } else if (this.scholarshipAmount !== undefined && this.scholarshipAmount !== null) {
    this.amount = this.scholarshipAmount;
  }

  if (this.deadline !== undefined && this.deadline !== null) {
    this.applicationDeadline = this.deadline;
  } else if (this.applicationDeadline !== undefined && this.applicationDeadline !== null) {
    this.deadline = this.applicationDeadline;
  }

  if (this.applicationUrl !== undefined && this.applicationUrl !== null) {
    this.applicationLink = this.applicationUrl;
  } else if (this.applicationLink !== undefined && this.applicationLink !== null) {
    this.applicationUrl = this.applicationLink;
  }

  if (this.eligibility !== undefined && this.eligibility !== null) {
    this.eligibilityCriteria = this.eligibility;
  } else if (this.eligibilityCriteria !== undefined && this.eligibilityCriteria !== null) {
    this.eligibility = this.eligibilityCriteria;
  }

  if (this.stateEligibility !== undefined && this.stateEligibility !== null) {
    this.state = this.stateEligibility;
  } else if (this.state !== undefined && this.state !== null) {
    this.stateEligibility = this.state;
  }

  next();
});

// Check if model is already registered before exporting to avoid Mongoose compilation errors during hot-reload
const Scholarship = mongoose.models.Scholarship || mongoose.model('Scholarship', scholarshipSchema);

export default Scholarship;
