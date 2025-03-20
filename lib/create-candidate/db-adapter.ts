import { z } from "zod";

import { prisma } from "@/lib/db";
import { parseDate } from "./date-parser";
import { candidateSchema } from "./schema";

interface SaveCandidateOptions {
  candidateData: z.infer<typeof candidateSchema>;
  organizationId: string;
  cvUrl: string;
}

interface SaveCandidateResult {
  success: boolean;
  candidateId?: string;
  error?: string;
}

/**
 * Creates or updates a candidate in the database
 */
export async function saveCandidateToDatabase({
  candidateData,
  organizationId,
  cvUrl,
}: SaveCandidateOptions): Promise<SaveCandidateResult> {
  try {
    console.log("💾 Saving candidate to database");

    const savedCandidate = await prisma.candidate.upsert({
      where: {
        email: candidateData.email,
      },
      create: {
        name: candidateData.name,
        email: candidateData.email,
        phoneNumber: candidateData.phoneNumber,
        organizationId,
        cvUrl,
        processing: false,
        education: {
          create:
            candidateData.education?.length > 0
              ? candidateData.education.map((edu) => ({
                  degree: edu.degree,
                  school: edu.school,
                  startDate: parseDate(edu.startDate),
                  endDate: edu.endDate ? parseDate(edu.endDate) : null,
                  description: edu.description,
                }))
              : [],
        },
        skills: {
          create:
            candidateData.skills?.length > 0
              ? candidateData.skills.map((skill) => ({
                  name: skill.name,
                  type: skill.type,
                  proficiency: skill.proficiency,
                }))
              : [],
        },
        workExperience: {
          create:
            candidateData.workExperience?.length > 0
              ? candidateData.workExperience.map((exp) => ({
                  company: exp.company,
                  title: exp.title,
                  startDate: parseDate(exp.startDate),
                  endDate: exp.endDate ? parseDate(exp.endDate) : null,
                  description: exp.description,
                }))
              : [],
        },
        achievements: {
          create:
            candidateData.achievements?.length > 0
              ? candidateData.achievements.map((achievement) => ({
                  title: achievement.title,
                  description: achievement.description,
                  date: achievement.date ? parseDate(achievement.date) : null,
                }))
              : [],
        },
        certificates: {
          create:
            candidateData.certificates?.length > 0
              ? candidateData.certificates.map((cert) => ({
                  name: cert.name,
                  date: parseDate(cert.date),
                }))
              : [],
        },
        socialLinks: {
          create:
            candidateData.socialLinks?.length > 0
              ? candidateData.socialLinks.map((link) => ({
                  url: link.url,
                  type: link.type,
                }))
              : [],
        },
      },
      update: {
        name: candidateData.name,
        email: candidateData.email,
        phoneNumber: candidateData.phoneNumber,
        cvUrl,
        organizationId,
        processing: false,
        education: {
          deleteMany: {},
          create:
            candidateData.education?.length > 0
              ? candidateData.education.map((edu) => ({
                  degree: edu.degree,
                  school: edu.school,
                  startDate: parseDate(edu.startDate),
                  endDate: edu.endDate ? parseDate(edu.endDate) : null,
                  description: edu.description,
                }))
              : [],
        },
        skills: {
          deleteMany: {},
          create:
            candidateData.skills?.length > 0
              ? candidateData.skills.map((skill) => ({
                  name: skill.name,
                  type: skill.type,
                  proficiency: skill.proficiency,
                }))
              : [],
        },
        workExperience: {
          deleteMany: {},
          create:
            candidateData.workExperience?.length > 0
              ? candidateData.workExperience.map((exp) => ({
                  company: exp.company,
                  title: exp.title,
                  startDate: parseDate(exp.startDate),
                  endDate: exp.endDate ? parseDate(exp.endDate) : null,
                  description: exp.description,
                }))
              : [],
        },
        achievements: {
          deleteMany: {},
          create:
            candidateData.achievements?.length > 0
              ? candidateData.achievements.map((achievement) => ({
                  title: achievement.title,
                  description: achievement.description,
                  date: achievement.date ? parseDate(achievement.date) : null,
                }))
              : [],
        },
        certificates: {
          deleteMany: {},
          create:
            candidateData.certificates?.length > 0
              ? candidateData.certificates.map((cert) => ({
                  name: cert.name,
                  date: parseDate(cert.date),
                }))
              : [],
        },
        socialLinks: {
          deleteMany: {},
          create:
            candidateData.socialLinks?.length > 0
              ? candidateData.socialLinks.map((link) => ({
                  url: link.url,
                  type: link.type,
                }))
              : [],
        },
      },
    });

    console.log("✅ Candidate saved successfully:", savedCandidate.id);

    return {
      success: true,
      candidateId: savedCandidate.id,
    };
  } catch (error) {
    console.error("❌ Database save error:", error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
} 