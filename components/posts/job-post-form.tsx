"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJobPost, updateJobPost } from "@/actions/create-job-post.server";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  jobPostSchema,
  type JobPostFormData,
} from "@/lib/validations/job-post";
import { Button } from "@/components/ui/button";
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
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { JobPostWithDetails } from "@/actions/get-job-post-by-id.server";

interface JobPostFormProps {
  post?: JobPostWithDetails;
  onSuccess?: () => void;
}

export function JobPostForm({ post, onSuccess }: JobPostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<JobPostFormData>({
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      title: post?.title ?? "",
      description: post?.description ?? "",
      companyName: post?.companyName ?? "",
      skills: post?.weights.map(weight => ({
        name: weight.name,
        weight: weight.weight,
        type: weight.type
      })) ?? [{ name: "", weight: 5, type: "HARD" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "skills",
    control: form.control,
  });

  async function onSubmit(data: JobPostFormData) {
    try {
      setIsSubmitting(true);
      const response = post 
        ? await updateJobPost(post.id, data)
        : await createJobPost(data);

      if (response.success) {
        toast.success(response.message);
        form.reset();
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="Senior Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Tech Company Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the role and responsibilities..."
                    className="h-32 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Skills & Technologies</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", weight: 5, type: "HARD" })}
              >
                <Plus className="mr-2 size-4" />
                Add Skill
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 rounded-lg border p-4">
                <div className="grid gap-4 md:grid-cols-[2fr,1fr,auto]">
                  <FormField
                    control={form.control}
                    name={`skills.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., React, TypeScript"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`skills.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HARD">Hard Skill</SelectItem>
                            <SelectItem value="SOFT">Soft Skill</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="self-end"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name={`skills.${index}.weight`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Importance (1-10)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-1"
                          />
                          <span className="w-12 text-center">
                            {field.value}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {post ? "Update" : "Create"} Job Post
        </Button>
      </form>
    </Form>
  );
}
