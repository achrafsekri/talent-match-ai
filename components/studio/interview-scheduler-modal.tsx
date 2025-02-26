"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Video } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MatchWithCandidate } from "@/types";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Steps } from "../ui/steps";
import { Checkbox } from "@/components/ui/checkbox";

const interviewFormSchema = z.object({
  type: z.enum(["ONLINE", "IN_PERSON"]),
  date: z.date(),
  time: z.string(),
  location: z.string().optional(),
  useGoogleCalendar: z.boolean().default(true),
  meetLink: z.string().optional(),
});

type InterviewFormValues = z.infer<typeof interviewFormSchema>;

interface InterviewSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: MatchWithCandidate[];
  onSchedule: (values: InterviewFormValues, matchId: string) => Promise<void>;
}

export function InterviewSchedulerModal({
  isOpen,
  onClose,
  matches,
  onSchedule,
}: InterviewSchedulerModalProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      type: "ONLINE",
      time: "10:00",
      useGoogleCalendar: true,
    },
  });

  // Guard against empty matches array
  if (!matches.length) {
    return null;
  }

  const currentMatch = matches[currentStep];

  async function onSubmit(values: InterviewFormValues) {
    try {
      setIsPending(true);

      let meetLink;
      if (values.type === "ONLINE" && values.useGoogleCalendar) {
        try {
          const dateString = format(values.date, "yyyy-MM-dd");
          
          const response = await fetch("/api/meetings/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              date: dateString,
              time: values.time,
              attendees: [currentMatch.candidate.email],
              title: `Interview with ${currentMatch.candidate.name}${
                currentMatch.post?.title ? ` for ${currentMatch.post.title}` : ''
              }`,
              description: `Job Interview${
                currentMatch.post?.title ? ` for ${currentMatch.post.title} position` : ''
              }${
                currentMatch.post?.companyName ? ` at ${currentMatch.post.companyName}` : ''
              }`,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to create meeting");
          }

          const data = await response.json();
          console.log("Meeting created:", data);
          meetLink = data.meetLink;
        } catch (error) {
          console.error("Failed to create calendar event:", error);
          toast.error(error instanceof Error ? error.message : "Failed to create Google Calendar event");
          return;
        }
      }

      await onSchedule(
        {
          ...values,
          meetLink,
        },
        currentMatch.id
      );
      
      if (currentStep < matches.length - 1) {
        setCurrentStep(currentStep + 1);
        form.reset(values);
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Failed to schedule interview:", error);
      toast.error("Failed to schedule interview");
    } finally {
      setIsPending(false);
    }
  }

  const interviewType = form.watch("type");
  const useGoogleCalendar = form.watch("useGoogleCalendar");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Schedule Interview
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Candidate {currentStep + 1} of {matches.length}:</span>
            <span className="font-medium text-foreground">
              {currentMatch.candidate.name}
            </span>
            <span className="text-xs">({currentMatch.candidate.email})</span>
            {currentMatch.post?.title && (
              <span className="text-xs text-muted-foreground">
                for {currentMatch.post.title}
              </span>
            )}
          </div>
        </DialogHeader>

        <Steps
          steps={matches.map((m) => ({ 
            title: m.candidate.name,
            description: m.candidate.email 
          }))}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select interview type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ONLINE">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          <span>Online Meeting</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="IN_PERSON">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>In-Person Interview</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="useGoogleCalendar"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Schedule with Google Calendar
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Create calendar events and send invites automatically
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Interview Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {interviewType === "IN_PERSON" && (
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interview Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter office address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0 || isPending}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="gap-2"
              >
                {isPending ? (
                  <>Processing...</>
                ) : currentStep === matches.length - 1 ? (
                  <>Finish</>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 