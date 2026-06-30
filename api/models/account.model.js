import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const accountSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ["applicant", "recruiter", "admin"],
      default: "applicant",
    },

    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpiry: {
      type: Date,
      select: false,
    },

    // Refresh token
    refreshToken: {
      type: String,
      select: false,
    },

    // Applicant-specific fields
    applicantProfile: {
      headline: { type: String, trim: true },
      bio: { type: String, trim: true },
      skills: [{ type: String, trim: true }],
      resumeUrl: { type: String },    // S3 URL (Phase 4)
      avatarUrl: { type: String },
      location: { type: String },
      linkedIn: { type: String },
      github: { type: String },
    },

    // Recruiter-specific fields
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",  // we'll build this model later
    },

    // Account status (for admin moderation)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Hash password before saving
accountSchema.pre("save", async function (next) {
  // Only hash if password was modified
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords (used during login)
accountSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
accountSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const Account = mongoose.model("Account", accountSchema);
export default Account;