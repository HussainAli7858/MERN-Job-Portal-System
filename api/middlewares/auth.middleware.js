import { verifyAccessToken } from "../utils/token.utils.js";
import Account from "../models/account.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from cookie OR Authorization header (Bearer token)
  const token =
    req.cookies?.accessToken ||
    req.headers?.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Access denied. Please login to continue");
  }

  // Verify the token
  const decoded = verifyAccessToken(token);

  // Find the account
  const account = await Account.findById(decoded.id);

  if (!account) {
    throw new ApiError(401, "Account not found. Please login again");
  }

  if (!account.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  // Attach account to request object — available in all controllers after this
  req.account = account;
  next();
});

export default authenticate;