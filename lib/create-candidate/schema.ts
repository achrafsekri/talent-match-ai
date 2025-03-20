import { z } from "zod";

export const candidateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().optional(),
  skills: z
    .array(
      z.object({
        name: z.string().min(1, "Skill name is required"),
        type: z.enum(["HARD", "SOFT"]).default("HARD"),
        proficiency: z.number().min(1).max(10),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        degree: z.string().min(1, "Degree is required"),
        school: z.string().min(1, "School is required"),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().nullable(),
        description: z.string().optional(),
      }),
    )
    .default([]),
  workExperience: z
    .array(
      z.object({
        company: z.string().min(1, "Company is required"),
        title: z.string().min(1, "Title is required"),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().nullable(),
        description: z.string().min(1, "Description is required"),
      }),
    )
    .default([]),
  achievements: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        date: z.string().optional(),
      }),
    )
    .default([]),
  certificates: z
    .array(
      z.object({
        name: z.string().min(1, "Certificate name is required"),
        date: z.string().min(1, "Certificate date is required"),
      }),
    )
    .default([]),
  socialLinks: z
    .array(
      z.object({
        url: z.string().min(1, "URL is required"),
        type: z.enum([
          "LINKEDIN",
          "X",
          "TWITTER",
          "FACEBOOK",
          "GITHUB",
          "YOUTUBE",
          "INSTAGRAM",
          "TIKTOK",
          "MEDIUM",
          "BLOG",
          "OTHER",
        ]),
      }),
    )
    .default([]),
}); 