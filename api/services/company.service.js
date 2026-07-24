import crypto from "crypto";
import Company from "../models/company.model.js";
import Invitation from "../models/invitation.model.js";
import Account from "../models/account.model.js";
import ApiError from "../utils/ApiError.js";
import { sendEmail } from "../utils/email.utils.js";

// Create a new company — recruiter becomes owner + admin member
export const createCompany = async ({ name, description, website, location, industry, ownerId }) => {
  const existingCompany = await Company.findOne({ owner: ownerId });
  if (existingCompany) {
    throw new ApiError(409, "You already have a registered company");
  }

  const company = await Company.create({
    name,
    description,
    website,
    location,
    industry,
    owner: ownerId,
    members: [{ account: ownerId, role: "admin" }],
  });

  // Link company to recruiter account
  await Account.findByIdAndUpdate(ownerId, { companyId: company._id });

  return company;
};

// Get company details
export const getCompany = async (companyId) => {
  const company = await Company.findById(companyId)
    .populate("owner", "firstName lastName email")
    .populate("members.account", "firstName lastName email");

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return company;
};

// Invite a team member
export const inviteMember = async ({ email, role, companyId, invitedById }) => {
  const company = await Company.findById(companyId);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // Check inviter is admin of this company
  const inviterMember = company.members.find(
    (m) => m.account.toString() === invitedById.toString() && m.role === "admin"
  );
  if (!inviterMember && company.owner.toString() !== invitedById.toString()) {
    throw new ApiError(403, "Only company admins can invite members");
  }

  // Check if already a member
  const existingAccount = await Account.findOne({ email });
  if (existingAccount && company.members.some(
    (m) => m.account.toString() === existingAccount._id.toString()
  )) {
    throw new ApiError(409, "This person is already a company member");
  }

  // Generate invitation token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  await Invitation.create({
    email,
    company: companyId,
    invitedBy: invitedById,
    role: role || "member",
    token,
    expiresAt,
  });

  // Send invitation email
  const inviteUrl = `${process.env.CLIENT_URL}/invitations/accept?token=${token}`;
  await sendEmail({
    to: email,
    subject: `You've been invited to join ${company.name} on Job Portal`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're invited to join ${company.name}!</h2>
        <p>You've been invited to join as a <strong>${role || "member"}</strong>.</p>
        <a 
          href="${inviteUrl}"
          style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #4F46E5;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 16px 0;
          "
        >
          Accept Invitation
        </a>
        <p>This invite expires in 48 hours.</p>
      </div>
    `,
  });

  return { message: "Invitation sent successfully" };
};

// Accept invitation
export const acceptInvitation = async ({ token, accountId }) => {
  const invitation = await Invitation.findOne({
    token,
    status: "pending",
    expiresAt: { $gt: new Date() },
  });

  if (!invitation) {
    throw new ApiError(400, "Invalid or expired invitation");
  }

  // Add member to company
  await Company.findByIdAndUpdate(invitation.company, {
    $push: {
      members: { account: accountId, role: invitation.role },
    },
  });

  // Link company to account
  await Account.findByIdAndUpdate(accountId, {
    companyId: invitation.company,
  });

  // Mark invitation as accepted
  await Invitation.findByIdAndUpdate(invitation._id, { status: "accepted" });

  return { message: "Successfully joined the company" };
};