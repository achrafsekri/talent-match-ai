import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

import { candidateSchema } from "./schema";

interface ExtractResumeResult {
  success: boolean;
  data?: z.infer<typeof candidateSchema>;
  error?: string;
}

/**
 * Extracts structured candidate data from a resume file using AI
 */
export async function extractResumeData(
  file: File
): Promise<ExtractResumeResult> {
  try {
    console.log("🤖 Processing CV with Google Gemini");

    // Use any to bypass type checking for the model
    const modelConfig = google("gemini-1.5-pro", {
      structuredOutputs: false,
    }) as any;

    const { object: candidateData } = await generateObject({
      model: modelConfig,
      schema: candidateSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract all relevant information from this resume in a detailed way, Extract the following in JSON format:
                    1. Name, email, and phone number
                    2. Skills (both HARD and SOFT) with proficiency level 1-10
                    3. Education history with degree, school, dates, and descriptions
                    4. Work experience with company, title, dates, and descriptions
                    5. Achievements with titles, descriptions, and dates
                    6. Certificates with names and dates
                    7. Social links with URLs and types (LINKEDIN, GITHUB, etc.)

                    Format dates as YYYY-MM-DD when possible. Use null for ongoing activities.`,
            },
            {
              type: "file",
              data: await file.arrayBuffer(),
              mimeType: file.type,
            },
          ],
        },
      ],
    });

    console.log("✅ AI processing complete:", {
      name: candidateData.name,
      skillsCount: candidateData.skills.length,
    });

    return {
      success: true,
      data: candidateData,
    };
  } catch (error) {
    console.error("❌ AI extraction error:", error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
} 