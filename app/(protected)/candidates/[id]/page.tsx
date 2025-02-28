import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlanMeetingDialog } from "@/components/candidates/plan-meeting-dialog";

import { getCandidateById } from "@/lib/candidates";
import { CandidateDetails } from "@/components/candidates/candidate-details";
import { CandidateDetailsSkeleton } from "@/components/candidates/candidate-details-skeleton";
import { DashboardHeader } from "@/components/dashboard/header";

interface CandidatePageProps {
  params: {
    id: string;
  };
}

export default async function CandidatePage({ params }: CandidatePageProps) {
  const candidate = await getCandidateById(params.id);

  if (!candidate) {
    notFound();
  }

  // Get the job title from the first match if available
  const jobTitle = candidate.matches && candidate.matches.length > 0
    ? candidate.matches[0].post.title
    : "Interview";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <DashboardHeader
          heading={candidate.name}
          text="View and manage candidate details"
        />
        <PlanMeetingDialog 
          candidateId={candidate.id} 
          candidateEmail={candidate.email}
          candidateName={candidate.name}
          jobTitle={jobTitle}
        />
      </div>

      <Suspense fallback={<CandidateDetailsSkeleton />}>
        <CandidateDetails candidate={candidate} />
      </Suspense>
    </div>
  );
}
