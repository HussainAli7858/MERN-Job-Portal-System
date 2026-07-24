import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleJobStatus,
} from "../services/job.service.js";

// POST /api/jobs
export const create = asyncHandler(async (req, res) => {
  const job = await createJob({
    jobData: req.body,
    recruiterId: req.account._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, "Job posted successfully", job));
});

// GET /api/jobs/my-jobs
export const myJobs = asyncHandler(async (req, res) => {
  const jobs = await getMyJobs(req.account._id);
  return res
    .status(200)
    .json(new ApiResponse(200, "Jobs fetched successfully", jobs));
});

// GET /api/jobs/:id
export const getOne = asyncHandler(async (req, res) => {
  const job = await getJobById({
    jobId: req.params.id,
    recruiterId: req.account._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, "Job fetched successfully", job));
});

// PUT /api/jobs/:id
export const update = asyncHandler(async (req, res) => {
  const job = await updateJob({
    jobId: req.params.id,
    recruiterId: req.account._id,
    updates: req.body,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, "Job updated successfully", job));
});

// DELETE /api/jobs/:id
export const remove = asyncHandler(async (req, res) => {
  const result = await deleteJob({
    jobId: req.params.id,
    recruiterId: req.account._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, result.message, null));
});

// PATCH /api/jobs/:id/status
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const job = await toggleJobStatus({
    jobId: req.params.id,
    recruiterId: req.account._id,
    status,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, "Job status updated successfully", job));
});