import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    // Foreign keys
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPosting",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    // Snapshot of applicant profile at time of applying (chapter 51)
    // This preserves the profile even if applicant updates it later
    profileSnapshot: {
      firstName: String,
      lastName: String,
      email: String,
      headline: String,
      skills: [String],
      resumeUrl: String,
      linkedIn: String,
    },

    // Cover letter / SOP
    coverLetter: {
      type: String,
      trim: true,
    },

    // Application stages
    status: {
      type: String,
      enum: [
        "applied",       // just submitted
        "reviewing",     // recruiter is reviewing
        "shortlisted",   // moved forward
        "interview",     // interview scheduled
        "offered",       // offer made
        "rejected",      // rejected
        "withdrawn",     // applicant withdrew
      ],
      default: "applied",
    },

    // Interview details (Phase 4)
    interview: {
      scheduledAt: { type: Date },
      location: { type: String },   // or video call link
      notes: { type: String },
      feedback: { type: String },
    },

    // Idempotency — prevent duplicate applications (chapter 53)
    idempotencyKey: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent same applicant applying to same job twice
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);
export default Application;