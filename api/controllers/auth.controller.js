import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { registerAccount, loginAccount } from "../services/auth.service.js";

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