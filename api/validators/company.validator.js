import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().trim().min(2, "Company name must be at least 2 characters").max(100),
  description: z.string().trim().optional(),
  website: z.string().trim().url("Invalid website URL").optional(),
  location: z.string().trim().optional(),
  industry: z.string().trim().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  role: z.enum(["admin", "member"]).optional(),
});