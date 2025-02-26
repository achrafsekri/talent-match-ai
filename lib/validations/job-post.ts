import * as z from "zod";

export const skillWeightSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  weight: z.number().min(1).max(10),
  type: z.enum(["HARD", "SOFT"]).default("HARD"),
});

export const jobPostSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  companyName: z.string().min(1, "Company name is required"),
  skills: z.array(skillWeightSchema).min(1, "At least one skill is required"),
});

export type JobPostFormData = z.infer<typeof jobPostSchema>;
export type SkillWeightFormData = z.infer<typeof skillWeightSchema>;
