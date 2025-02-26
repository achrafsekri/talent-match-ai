"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { sendMatchEmails } from "@/actions/send-match-emails";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { MatchStatus } from "@prisma/client";
import { ChevronLeft, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { useMatches } from "@/hooks/use-matches";

import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { MatchColumn } from "./match-column";
import { InterviewSchedulerModal } from "./interview-scheduler-modal";

interface MatchStudioBoardProps {
  postId: string;
  jobTitle: string;
}

const COLUMN_TITLES: Partial<Record<MatchStatus, string>> = {
  NEW: "New Matches",
  CONTACTED: "Contacted",
  INTERVIEWING: "Interviewing",
  HIRED: "Final Decision",
};

// Statuses to show in the Kanban board
const VISIBLE_STATUSES = ["NEW", "CONTACTED", "INTERVIEWING", "HIRED"] as const;

export function MatchStudioBoard({ postId, jobTitle }: MatchStudioBoardProps) {
  const { matches, isLoading, updateMatchStatus, fetchMatches } =
    useMatches(postId);
  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<string>>(
    new Set(),
  );
  const [columns, setColumns] = useState<Record<MatchStatus, string[]>>({
    NEW: [],
    CONTACTED: [],
    INTERVIEWING: [],
    HIRED: [],
    REJECTED: [],
  });
  const [isSending, setIsSending] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [selectedForInterview, setSelectedForInterview] = useState<string[]>([]);

  useEffect(() => {
    if (!matches) return;

    const newColumns = Object.values(MatchStatus).reduce(
      (acc, status) => {
        if (status === "REJECTED") {
          return acc;
        }

        acc[status] = matches
          .filter((match) =>
            status === "HIRED"
              ? match.status === "HIRED" || match.status === "REJECTED"
              : match.status === status,
          )
          .map((match) => match.id);
        return acc;
      },
      {} as Record<MatchStatus, string[]>,
    );

    setColumns(newColumns);
  }, [matches]);

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;

      if (!destination) {
        return;
      }

      const sourceStatus = source.droppableId as MatchStatus;
      const destinationStatus = destination.droppableId as MatchStatus;

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const match = matches?.find((m) => m.id === draggableId);
      if (!match) {
        console.error("Match not found:", draggableId);
        return;
      }

      let newStatus = destinationStatus;

      // If dragging to "Final Decision" column, show a dialog to choose HIRED or REJECTED
      if (destinationStatus === "HIRED" && sourceStatus !== "HIRED") {
        newStatus = window.confirm(
          "Would you like to mark this candidate as hired? Click OK for Hired, Cancel for Rejected",
        )
          ? "HIRED"
          : "REJECTED";
      }

      // Optimistically update UI first
      setColumns((prev) => {
        const newColumns = { ...prev };
        // Remove from source column
        newColumns[sourceStatus] = prev[sourceStatus].filter(
          (id) => id !== draggableId,
        );
        // Add to destination column
        const targetColumn = newStatus === "REJECTED" ? "HIRED" : newStatus;
        newColumns[targetColumn] = [
          ...prev[targetColumn].slice(0, destination.index),
          draggableId,
          ...prev[targetColumn].slice(destination.index),
        ];
        return newColumns;
      });

      try {
        // Update backend
        await updateMatchStatus(draggableId, newStatus);
      } catch (error) {
        console.error("Failed to update match status:", error);
        // Revert the columns to their previous state on error
        setColumns((prev) => {
          const newColumns = { ...prev };
          Object.values(MatchStatus).forEach((status) => {
            newColumns[status] = prev[status].filter(
              (id) => id !== draggableId,
            );
          });
          newColumns[match.status].push(draggableId);
          return newColumns;
        });
      }
    },
    [matches, updateMatchStatus],
  );

  const handleMatchSelect = useCallback(
    (matchId: string, selected: boolean) => {
      setSelectedMatchIds((prev) => {
        const next = new Set(prev);
        if (selected) {
          next.add(matchId);
        } else {
          next.delete(matchId);
        }
        return next;
      });
    },
    [],
  );

  const handleScheduleInterview = useCallback(async (values: InterviewFormValues, matchId: string) => {
    try {
      // Generate Google Meet link if online interview
      let meetLink;
      if (values.type === "ONLINE") {
        const response = await fetch("/api/meetings/create", {
          method: "POST",
          body: JSON.stringify({
            date: values.date,
            time: values.time,
          }),
        });
        const data = await response.json();
        meetLink = data.meetLink;
      }

      // Send email with interview details for single candidate
      const response = await sendMatchEmails({
        matchIds: [matchId], // Send to single candidate
        postId,
        interviewDetails: {
          ...values,
          meetLink,
        },
      });

      if (response.success) {
        toast.success(response.message);
        // Don't clear all selections, just remove the processed one
        setSelectedMatchIds((prev) => {
          const next = new Set(prev);
          next.delete(matchId);
          return next;
        });
        await fetchMatches();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Failed to schedule interview:", error);
      toast.error("Failed to schedule interview. Please try again.");
    }
  }, [postId, fetchMatches]);

  const handleSendEmails = useCallback(() => {
    const selectedCount = selectedMatchIds.size;
    if (selectedCount === 0) {
      toast.error("Please select at least one candidate");
      return;
    }
    // Convert selected matches to array and set for interview scheduling
    const selectedIds = Array.from(selectedMatchIds);
    setSelectedForInterview(selectedIds);
    setIsSchedulerOpen(true);
  }, [selectedMatchIds]);

  const selectedNewMatches = matches?.filter(
    (m) => m.status === "NEW" && selectedMatchIds.has(m.id),
  );

  const selectedMatches = matches?.filter(
    (m) => selectedForInterview.includes(m.id)
  ) ?? [];

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <Link
                  href={`/posts/${postId}`}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="size-4" />
                  Back to Job
                </Link>
              </Button>
              <h1 className="text-xl font-semibold">{jobTitle}</h1>
            </div>
            {selectedNewMatches && selectedNewMatches.length > 0 && (
              <Button
                size="sm"
                className="gap-2"
                onClick={handleSendEmails}
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="size-4" />
                    Send Emails ({selectedNewMatches.length})
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" />
            <div className="absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" />
            <div className="scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent flex gap-4 overflow-x-auto px-8 pb-4">
              {VISIBLE_STATUSES.map((status) => (
                <Droppable key={status} droppableId={status} type="match">
                  {(provided) => (
                    <MatchColumn
                      title={COLUMN_TITLES[status]!}
                      matches={
                        matches?.filter((m) =>
                          status === "HIRED"
                            ? m.status === "HIRED" || m.status === "REJECTED"
                            : m.status === status,
                        ) ?? []
                      }
                      provided={provided}
                      selectedMatches={selectedMatchIds}
                      onMatchSelect={handleMatchSelect}
                    />
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </div>
      </DragDropContext>

      {isSchedulerOpen && selectedMatches.length > 0 && (
        <InterviewSchedulerModal
          isOpen={isSchedulerOpen}
          onClose={() => setIsSchedulerOpen(false)}
          matches={selectedMatches}
          onSchedule={handleScheduleInterview}
        />
      )}
    </>
  );
}
