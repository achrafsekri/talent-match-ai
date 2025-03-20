import { processMultipleResumes } from "@/lib/create-candidate";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 401 });
  }

  const currentOrgId = user?.organizationId;

  if (!user?.organizationId) {
    console.error("❌ Upload failed: User not found or no organization");
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  console.log("✅ User authenticated:", { organizationId: currentOrgId });

  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files.length) {
      console.error("❌ Upload failed: No files provided");
      return Response.json({ error: "No files provided" }, { status: 400 });
    }
    console.log("📁 Processing files:", { count: files.length });

    // Process all files with the helper function
    const { successful: successfulUploads, failed: failedUploads } = 
      await processMultipleResumes(files);

    console.log("📊 Upload process complete:", {
      total: files.length,
      successful: successfulUploads.length,
      failed: failedUploads.length,
    });

    if (failedUploads.length > 0 && successfulUploads.length === 0) {
      return Response.json(
        {
          success: false,
          error: "All uploads failed",
          details: failedUploads,
        },
        { status: 500 },
      );
    }

    return Response.json({
      success: true,
      uploaded: successfulUploads,
      failed: failedUploads.length > 0 ? failedUploads : undefined,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to process upload",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
