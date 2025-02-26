import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { InterviewConfirmationForm } from "./interview-confirmation-form";

interface PageProps {
  params: {
    matchId: string;
  };
}

export default async function InterviewConfirmationPage({
  params,
}: PageProps) {
  const match = await prisma.match.findUnique({
    where: { id: params.matchId },
    select: {
      id: true,
      interviewDetails: true,
      post: {
        select: {
          title: true,
          companyName: true,
        },
      },
    },
  });

  if (!match) {
    redirect("/404");
  }

  const formattedMatch = {
    id: match.id,
    post: match.post,
    interviewDetails: match.interviewDetails ? {
      type: (match.interviewDetails as any).type,
      date: (match.interviewDetails as any).date,
      time: (match.interviewDetails as any).time,
      location: (match.interviewDetails as any).location,
      meetLink: (match.interviewDetails as any).meetLink,
    } : null
  };

  return <InterviewConfirmationForm match={formattedMatch} />;
} 