import Account from "../models/account.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { registerAccount, loginAccount } from "../services/auth.service.js";
import authenticate from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../services/token.service.js";

const cookieOptions = {
  httpOnly: true, // JS on the browser cannot access this cookie — prevents XSS
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict",
};

export const register = asyncHandler(async (req, res) => {
  const account = await registerAccount(req.body);

  // Never send password back, even hashed
  const safeAccount = {
    id: account._id,
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    role: account.role,
  };

  return res
    .status(201)
    .json(new ApiResponse(201, "Account created successfully", safeAccount));
});

export const login = asyncHandler(async (req, res) => {
  const { account, accessToken, refreshToken } = await loginAccount(req.body);

  const safeAccount = {
    id: account._id,
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    role: account.role,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(new ApiResponse(200, "Login successful", { account: safeAccount, accessToken }));
});


export const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "Account fetched successfully", req.account));
});

// POST /api/auth/logout — logout current user
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token from DB
  await Account.findByIdAndUpdate(req.account._id, { refreshToken: null });

  // Clear cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "Logged out successfully", null));
});


export const refreshToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookie or body
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  const { newAccessToken, newRefreshToken } = await refreshAccessToken(
    incomingRefreshToken
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
    .cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(
      new ApiResponse(200, "Tokens refreshed successfully", {
        accessToken: newAccessToken,
      })
    );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new ApiError(400, "Verification token is required");
  }

  // Find account with this token that hasn't expired
  const account = await Account.findOne({
    emailVerificationToken: token,
    emailVerificationExpiry: { $gt: new Date() }, // token must not be expired
  });

  if (!account) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  // Mark email as verified and clear the token
  await Account.findByIdAndUpdate(account._id, {
    isEmailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpiry: null,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Email verified successfully", null));
});