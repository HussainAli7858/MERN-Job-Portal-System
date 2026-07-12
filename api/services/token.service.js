import jwt from "jsonwebtoken";
import Account from "../models/account.model.js";
import ApiError from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.utils.js";

export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  // Verify the refresh token is valid (not expired, not tampered)
  const decoded = verifyRefreshToken(incomingRefreshToken);

  // Find account and explicitly select refreshToken (select:false by default)
  const account = await Account.findById(decoded.id).select("+refreshToken");

  if (!account) {
    throw new ApiError(401, "Account not found");
  }

  // Check the token matches what we stored in DB
  // This lets us invalidate tokens on logout
  if (account.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is invalid or already used");
  }

  if (!account.isActive) {
    throw new ApiError(403, "Account has been deactivated");
  }

  // Issue brand new tokens (token rotation — more secure)
  const newAccessToken = generateAccessToken(account._id);
  const newRefreshToken = generateRefreshToken(account._id);

  // Save new refresh token to DB (old one is now invalid)
  await Account.findByIdAndUpdate(
    account._id,
    { refreshToken: newRefreshToken },
    { new: true }
  );

  return { newAccessToken, newRefreshToken };
};