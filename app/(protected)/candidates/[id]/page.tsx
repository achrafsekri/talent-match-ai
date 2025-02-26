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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <DashboardHeader
          heading={candidate.name}
          text="View and manage candidate details"
        />
        <PlanMeetingDialog 
        candidateId={candidate.id} 
        candidateEmail={candidate.email} />
      </div>

      <Suspense fallback={<CandidateDetailsSkeleton />}>
        <CandidateDetails candidate={candidate} />
      </Suspense>
    </div>
  );
}
