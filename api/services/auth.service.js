import crypto from "crypto";
import Account from "../models/account.model.js";
import ApiError from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.utils.js";
import { sendVerificationEmail } from "./email.service.js";

export const registerAccount = async ({ firstName, lastName, email, password, role }) => {
  const existingAccount = await Account.findOne({ email });
  if (existingAccount) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); 

  const account = await Account.create({
    firstName,
    lastName,
    email,
    password,
    role: role || "applicant",
    emailVerificationToken,
    emailVerificationExpiry,
  });

  try {
    await sendVerificationEmail({
      email: account.email,
      firstName: account.firstName,
      token: emailVerificationToken,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error.message);
  }

  return account;
};

export const loginAccount = async ({ email, password }) => {
  const account = await Account.findOne({ email }).select("+password");

  if (!account) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!account.isActive) {
    throw new ApiError(403, "This account has been deactivated");
  }

  const isPasswordValid = await account.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(account._id);
  const refreshToken = generateRefreshToken(account._id);

    await Account.findByIdAndUpdate(
    account._id,
    { refreshToken },
    { new: true }
  );

  return { account, accessToken, refreshToken };
};