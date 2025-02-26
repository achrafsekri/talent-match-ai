"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Candidate, CandidateSkill, Match } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteCandidate } from "@/lib/actions/candidate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface CandidateCardProps {
  candidate: Candidate & {
    skills: CandidateSkill[];
    matches: Match[];
  };
}

function formatDate(date: Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeMatches = candidate.matches.filter(
    (match) => match.status !== "REJECTED" && match.status !== "HIRED",
  );

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteCandidate(candidate.id);

      if (result.success) {
        toast.success("Candidate deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete candidate");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the candidate");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card
        className="group relative min-h-[19em] cursor-pointer overflow-hidden bg-card transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5"
        onClick={(e) => {
          // Prevent navigation if clicking on the delete button
          if ((e.target as HTMLElement).closest("button")) return;
          router.push(`/candidates/${candidate.id}`);
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold leading-none tracking-tight transition-colors group-hover:text-primary">
                {candidate.name}
              </h3>
              <p className="text-base font-medium text-muted-foreground">
                {candidate.email}
              </p>
            </div>
            <Button
              variant="destructive"
              size="default"
              className="relative z-10 opacity-0 transition-all duration-200 group-hover:opacity-100"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </div>
          <div className="flex items-center gap-2.5 pt-2">
            <Badge variant="secondary" className="font-medium">
              {activeMatches.length} active{" "}
              {activeMatches.length === 1 ? "match" : "matches"}
            </Badge>
            {candidate.processing && (
              <Badge variant="outline" className="animate-pulse font-medium">
                Processing
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="group/content flex flex-wrap gap-2.5 transition-all">
          {candidate.skills.slice(0, 9).map((skill) => (
            <Badge
              key={skill.id}
              variant={skill.type === "HARD" ? "default" : "outline"}
              className="text-sm font-medium transition-all duration-300 hover:scale-105"
            >
              {skill.name}
            </Badge>
          ))}
          {candidate.skills.length > 9 && (
            <Badge variant="secondary" className="text-sm font-medium">
              +{candidate.skills.length - 9} more
            </Badge>
          )}
        </CardContent>
        <CardFooter className="mt-auto border-t bg-gradient-to-b from-muted/30 to-transparent py-4 text-sm text-muted-foreground">
          <div className="flex w-full justify-between font-medium">
            <span>Added {formatDate(candidate.createdAt)}</span>
            <span>Updated {formatDate(candidate.updatedAt)}</span>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-destructive">
              Delete Candidate
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {candidate.name}
              </span>
              ? This action cannot be undone and will remove all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="transition-all hover:bg-secondary">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground transition-all hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </span>
              ) : (
                "Delete Candidate"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
