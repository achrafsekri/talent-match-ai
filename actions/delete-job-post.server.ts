"use server";

import { ActionResponse } from "@/types";

import { prisma } from "@/lib/db";

export async function deleteJobPost(
  postId: string,
): Promise<ActionResponse<boolean>> {
  try {
    await prisma.jobPost.delete({
      where: { id: postId },
    });

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    console.error("[DELETE_JOB_POST]", error);
    return {
      success: false,
      error: "Failed to delete job post",
    };
  }
}
