"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface PlanMeetingDialogProps {
  candidateId: string;
  candidateEmail: string;
  candidateName: string;
}

export function PlanMeetingDialog({ 
  candidateId, 
  candidateEmail,
  candidateName,
}: PlanMeetingDialogProps) {
  const { data: session } = useSession();
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);
  const [meetingType, setMeetingType] = useState<"ONLINE" | "IN_PERSON">("ONLINE");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [useGoogleCalendar, setUseGoogleCalendar] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !title || !time) {
      toast.error("Please fill in all required fields");
      return;
    }
  
    setLoading(true);
    try {
      if (meetingType === "ONLINE" && useGoogleCalendar) {
        const dateString = format(date, "yyyy-MM-dd");
        
        const response = await fetch("/api/meetings/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: dateString,
            time,
            attendees: [candidateEmail],
            title: `Interview with ${candidateName}`,
            description: `Job Interview with ${candidateName}`,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create meeting");
        }

        const data = await response.json();
        console.log("Meeting created:", data);

        // Store the meeting details in your database here if needed
        // await saveMeetingDetails({ meetingId: data.eventId, candidateId, ...})

        toast.success("Meeting scheduled successfully!");
      } else {
        // Handle in-person meeting or non-Google Calendar meeting
        toast.success("Meeting details saved!");
      }
      
      setOpen(false);
    } catch (error) {
      console.error("Failed to schedule meeting:", error);
      toast.error(error instanceof Error ? error.message : "Failed to schedule meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Plan Meeting</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Plan a Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input 
              id="title" 
              placeholder="Enter meeting title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input 
              type="time" 
              id="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Meeting Type</Label>
            <Select
              value={meetingType}
              onValueChange={(value: "ONLINE" | "IN_PERSON") => setMeetingType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select meeting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONLINE">Online</SelectItem>
                <SelectItem value="IN_PERSON">In Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {meetingType === "IN_PERSON" && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="Enter meeting location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          )}
          {meetingType === "ONLINE" && (
            <div className="flex items-start space-x-3">
              <Checkbox
                id="useGoogleCalendar"
                checked={useGoogleCalendar}
                onCheckedChange={(checked) => setUseGoogleCalendar(checked as boolean)}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="useGoogleCalendar">
                  Schedule with Google Calendar
                </Label>
                <p className="text-sm text-muted-foreground">
                  Create calendar event and send invite automatically
                </p>
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              "Schedule Meeting"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}