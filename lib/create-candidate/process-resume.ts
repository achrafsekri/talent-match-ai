import { extractResumeData } from "./ai-extract";
import { saveCandidateToDatabase } from "./db-adapter";
import { uploadResumeToStorage } from "./storage";

export interface ProcessResumeResult {
  success: boolean;
  key?: string;
  name: string;
  candidateId?: string;
  error?: string;
}

interface ProcessResumeOptions {
  file: File;
  organizationId: string;
}

/**
 * Complete process for handling resume uploads:
 * 1. Upload to storage
 * 2. Extract data with AI
 * 3. Save to database
 */
export async function processResume({
  file,
  organizationId,
}: ProcessResumeOptions): Promise<ProcessResumeResult> {
  try {
    console.log("📄 Processing file:", { name: file.name });

    // Step 1: Upload to S3
    const uploadResult = await uploadResumeToStorage(file);
    if (!uploadResult.success) {
      throw new Error(`S3 upload failed: ${uploadResult.error}`);
    }
    
    // Step 2: Process with AI
    const extractionResult = await extractResumeData(file);
    if (!extractionResult.success || !extractionResult.data) {
      throw new Error(`AI extraction failed: ${extractionResult.error}`);
    }

    // Step 3: Save to database
    const saveResult = await saveCandidateToDatabase({
      candidateData: extractionResult.data,
      organizationId,
      cvUrl: uploadResult.key!,
    });
    
    if (!saveResult.success) {
      throw new Error(`Database save failed: ${saveResult.error}`);
    }

    return {
      key: uploadResult.key,
      name: file.name,
      success: true,
      candidateId: saveResult.candidateId,
    };
  } catch (error) {
    console.error(`❌ Error processing file ${file.name}:`, error);
    return {
      name: file.name,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Utility function to add delay between processing multiple files
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
} 