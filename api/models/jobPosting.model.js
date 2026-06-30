import mongoose from "mongoose";

const jobPostingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requirements: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],

    // Who posted it
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    // Which company
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    location: {
      type: String,
      trim: true,
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "lead"],
      required: true,
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "USD" },
    },

    // Status (for admin moderation)
    status: {
      type: String,
      enum: ["draft", "published", "closed", "rejected"],
      default: "draft",
    },

    // Deadline for applications
    applicationDeadline: { type: Date },

    // Track total applications (denormalized for performance)
    totalApplications: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast search & filtering (in chapter 42)
jobPostingSchema.index({ title: "text", description: "text", skills: "text" });
jobPostingSchema.index({ status: 1, createdAt: -1 });
jobPostingSchema.index({ company: 1 });
jobPostingSchema.index({ jobType: 1, experienceLevel: 1 });

const JobPosting = mongoose.model("JobPosting", jobPostingSchema);
export default JobPosting;