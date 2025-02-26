import type { Match as MatchWithCandidate } from "@/types";
import { DroppableProvided } from "@hello-pangea/dnd";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MatchCard } from "./match-card";

interface MatchColumnProps {
  title: string;
  matches: MatchWithCandidate[];
  provided: DroppableProvided;
  selectedMatches: Set<string>;
  onMatchSelect: (matchId: string, selected: boolean) => void;
}

export function MatchColumn({
  title,
  matches,
  provided,
  selectedMatches,
  onMatchSelect,
}: MatchColumnProps) {
  return (
    <Card className="h-fit min-h-[600px] w-[320px] shrink-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          {title}
          <span className="rounded-full bg-secondary px-2 py-1 text-xs">
            {matches.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="min-h-[500px] space-y-2"
        >
          {matches.map((match, index) => (
            <MatchCard
              key={match.id}
              match={match}
              index={index}
              selected={selectedMatches.has(match.id)}
              onSelect={onMatchSelect}
            />
          ))}
          {provided.placeholder}
        </div>
      </CardContent>
    </Card>
  );
}
