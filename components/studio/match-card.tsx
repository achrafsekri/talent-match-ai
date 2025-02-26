"use client";

import { useState } from "react";
import type { Match as MatchWithCandidate } from "@/types";
import { Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";

import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { MatchDetailsModal } from "./match-details-modal";

interface MatchCardProps {
  match: MatchWithCandidate;
  index: number;
  selected: boolean;
  onSelect: (matchId: string, selected: boolean) => void;
}

export function MatchCard({
  match,
  index,
  selected,
  onSelect,
}: MatchCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Draggable draggableId={match.id} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={cn(
              "cursor-pointer border bg-background transition-all duration-200",
              "relative hover:bg-accent/5",
              "ring-1 ring-border/50",
              match.status === "HIRED"
                ? "border-l-4 border-l-green-500"
                : match.status === "REJECTED"
                  ? "border-l-4 border-l-red-500"
                  : "border-l-4 border-l-transparent",
              "hover:shadow-sm hover:ring-accent/20",
              snapshot.isDragging && "scale-[1.02] shadow-lg ring-accent/30",
            )}
            onClick={() => setIsModalOpen(true)}
          >
            <CardContent className="flex flex-col gap-4 p-4">
              <div className="flex items-center justify-between">
                <div
                  {...provided.dragHandleProps}
                  className="-ml-1 p-1 text-muted-foreground/50 hover:text-foreground/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="size-5" />
                </div>
                {match.status === "NEW" && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(match.id, !selected);
                    }}
                  >
                    <Checkbox
                      checked={selected}
                      onCheckedChange={(checked) =>
                        onSelect(match.id, checked as boolean)
                      }
                      className="size-4"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold tracking-tight text-foreground">
                      {match.candidate.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
                          match.score >= 80
                            ? "bg-green-100 text-green-900 ring-green-200"
                            : match.score >= 60
                              ? "bg-yellow-100 text-yellow-900 ring-yellow-200"
                              : "bg-gray-100 text-gray-900 ring-gray-200",
                        )}
                      >
                        {Math.round(match.score)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {match.candidate.email}
                  </p>
                </div>

                {match.status !== "NEW" && (
                  <div className="flex items-center gap-2">
                    {match.status === "HIRED" && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-200">
                        Hired
                      </span>
                    )}
                    {match.status === "REJECTED" && (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200">
                        Rejected
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>

      <MatchDetailsModal
        match={match}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
