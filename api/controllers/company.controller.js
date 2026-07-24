import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createCompany,
  getCompany,
  inviteMember,
  acceptInvitation,
} from "../services/company.service.js";

export const create = asyncHandler(async (req, res) => {
  const company = await createCompany({
    ...req.body,
    ownerId: req.account._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, "Company created successfully", company));
});

export const get = asyncHandler(async (req, res) => {
  const company = await getCompany(req.account.companyId);
  return res
    .status(200)
    .json(new ApiResponse(200, "Company fetched successfully", company));
});

export const invite = asyncHandler(async (req, res) => {
  const result = await inviteMember({
    ...req.body,
    companyId: req.account.companyId,
    invitedById: req.account._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, result.message, null));
});

export const accept = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const result = await acceptInvitation({
    token,
    accountId: req.account._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, result.message, null));
});