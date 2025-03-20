import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { s3Client } from "@/lib/aws";

interface UploadFileResult {
  success: boolean;
  key?: string;
  error?: string;
}

/**
 * Uploads a file to S3 and returns the storage key
 */
export async function uploadResumeToStorage(file: File): Promise<UploadFileResult> {
  try {
    const objectId = randomUUID();
    const key = `candidates/${objectId}`;

    console.log("☁️ Uploading to S3:", { key });
    
    const uploadParams = {
      Bucket: process.env.CLOUD_AWS_S3_BUCKET,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log("✅ S3 upload complete");

    return {
      success: true,
      key,
    };
  } catch (error) {
    console.error("❌ S3 upload error:", error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
} 