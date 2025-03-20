import { getCurrentUser } from "@/lib/session";
import { processResume, ProcessResumeResult, sleep } from "./process-resume";

// Main public API
export { processResume, sleep } from "./process-resume";
export type { ProcessResumeResult } from "./process-resume";

/**
 * Process multiple resume files for a user with delay between each
 */
export async function processMultipleResumes(
  files: File[],
  delayMs = 2000
): Promise<{
  successful: ProcessResumeResult[];
  failed: ProcessResumeResult[];
}> {
  const user = await getCurrentUser();
  
  if (!user?.organizationId) {
    throw new Error("User not found or not part of an organization");
  }
  
  const results: ProcessResumeResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const result = await processResume({
        file,
        organizationId: user.organizationId,
      });
      results.push(result);
    } catch (error) {
      results.push({
        name: file.name,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }

    // Add delay between processing (but not after the last file)
    if (i < files.length - 1) {
      await sleep(delayMs);
    }
  }

  return {
    successful: results.filter(r => r.success),
    failed: results.filter(r => !r.success)
  };
}

// Sub-modules for direct access if needed
export * as schema from "./schema";
export * as storage from "./storage";
export * as aiExtract from "./ai-extract";
export * as dbAdapter from "./db-adapter";
export * as dateParser from "./date-parser"; 