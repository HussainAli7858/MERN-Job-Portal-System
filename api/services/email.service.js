import { sendEmail } from "../utils/email.utils.js";

export const sendVerificationEmail = async ({ email, firstName, token }) => {
  const verificationUrl = `${process.env.CLIENT_URL}/api/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your Job Portal email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Job Portal, ${firstName}!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a 
          href="${verificationUrl}" 
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
          Verify Email
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #6B7280;">${verificationUrl}</p>
        <p>This link expires in <strong>24 hours</strong>.</p>
        <p>If you did not create an account, ignore this email.</p>
      </div>
    `,
  });
};