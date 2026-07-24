import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().trim().min(20, "Description must be at least 20 characters"),
  requirements: z.array(z.string().trim()).optional(),
  skills: z.array(z.string().trim()).optional(),
  location: z.string().trim().optional(),
  jobType: z.enum(["full-time", "part-time", "contract", "internship", "remote"]),
  experienceLevel: z.enum(["entry", "mid", "senior", "lead"]),
  salary: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default("USD"),
  }).optional(),
  applicationDeadline: z.string().optional(), // ISO date string
});

export const updateJobSchema = createJobSchema.partial(); // all fields optional for update