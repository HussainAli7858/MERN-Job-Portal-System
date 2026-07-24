import JobPosting from "../models/jobPosting.model.js";
import Account from "../models/account.model.js";
import ApiError from "../utils/ApiError.js";

// Create a new job posting
export const createJob = async ({ jobData, recruiterId }) => {
  // Get recruiter's company (chapter 28 — query scoping)
  const recruiter = await Account.findById(recruiterId);
  if (!recruiter.companyId) {
    throw new ApiError(400, "You must create a company before posting jobs");
  }

  const job = await JobPosting.create({
    ...jobData,
    postedBy: recruiterId,
    company: recruiter.companyId,
    status: "published",
  });

  return job;
};

// Get all jobs posted by this recruiter (query scoped)
export const getMyJobs = async (recruiterId) => {
  const jobs = await JobPosting.find({ postedBy: recruiterId })
    .populate("company", "name logoUrl location")
    .sort({ createdAt: -1 });

  return jobs;
};

// Get single job — IDOR protected (chapter 29-30)
export const getJobById = async ({ jobId, recruiterId }) => {
  const job = await JobPosting.findOne({
    _id: jobId,
    postedBy: recruiterId, // ← must belong to THIS recruiter
  }).populate("company", "name logoUrl location");

  if (!job) {
    throw new ApiError(404, "Job not found");
    // Same error whether job doesn't exist OR belongs to someone else
    // Never reveal which — that leaks information
  }

  return job;
};

// Update job — IDOR protected
export const updateJob = async ({ jobId, recruiterId, updates }) => {
  const job = await JobPosting.findOneAndUpdate(
    {
      _id: jobId,
      postedBy: recruiterId, // ← IDOR protection
    },
    { ...updates },
    { new: true, runValidators: true }
  );

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  return job;
};

// Delete job — IDOR protected
export const deleteJob = async ({ jobId, recruiterId }) => {
  const job = await JobPosting.findOneAndDelete({
    _id: jobId,
    postedBy: recruiterId, // ← IDOR protection
  });

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  return { message: "Job deleted successfully" };
};

// Toggle job status (publish/close)
export const toggleJobStatus = async ({ jobId, recruiterId, status }) => {
  const job = await JobPosting.findOneAndUpdate(
    {
      _id: jobId,
      postedBy: recruiterId,
    },
    { status },
    { new: true }
  );

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  return job;
};