"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

const scopeSchema = z
  .object({
    scopeName: z.string().min(2, "Scope name is required."),
    owner: z.string().min(2, "Owner is required."),
    startDate: z.string().min(1, "Start date is required."),
    dueDate: z.string().min(1, "Due date is required."),
    scopeType: z.enum(
      ["Operational", "Compliance", "Reduction Program", "Supplier Engagement"],
      { errorMap: () => ({ message: "Select a scope type." }) },
    ),
    priority: z.enum(["Low", "Medium", "High", "Critical"], {
      errorMap: () => ({ message: "Select a priority." }),
    }),
    description: z
      .string()
      .min(10, "Description should be at least 10 characters."),
  })
  .refine((data) => new Date(data.dueDate) >= new Date(data.startDate), {
    message: "Due date must be after the start date.",
    path: ["dueDate"],
  });

export type CreateScopeValues = z.infer<typeof scopeSchema>;

type CreateScopeFormProps = {
  onCreated: (values: CreateScopeValues) => void;
  onCancel: () => void;
};

export default function CreateScopeForm({
  onCreated,
  onCancel,
}: CreateScopeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateScopeValues>({
    resolver: zodResolver(scopeSchema),
    defaultValues: {
      scopeName: "",
      owner: "",
      startDate: "",
      dueDate: "",
      scopeType: "Operational",
      priority: "Medium",
      description: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    const success = Math.random() > 0.2;
    if (!success) {
      toast.error(
        "Scope creation failed",
        "Temporary sync issue. Try submitting again.",
      );
      setIsSubmitting(false);
      return;
    }

    onCreated(values);
    toast.success(
      "Scope created",
      `${values.scopeName} has been added to your workspace.`,
    );
    setIsSubmitting(false);
    reset();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Scope Name"
        placeholder="Supplier Emissions Baseline"
        error={errors.scopeName?.message}
        {...register("scopeName")}
      />

      <Input
        label="Owner"
        placeholder="Jane Smith"
        error={errors.owner?.message}
        {...register("owner")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          type="date"
          label="Start Date"
          error={errors.startDate?.message}
          {...register("startDate")}
        />
        <Input
          type="date"
          label="Due Date"
          error={errors.dueDate?.message}
          {...register("dueDate")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800 dark:text-scope-text">
            Scope Type
          </label>
          <select
            className={cn(
              "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 dark:bg-scope-surface dark:text-scope-text",
              "outline-none transition-colors",
              "focus:border-scope-primary focus:ring-2 focus:ring-scope-primary/30",
              errors.scopeType ? "border-error" : "border-slate-300 dark:border-scope-border",
            )}
            {...register("scopeType")}
          >
            <option value="Operational">Operational</option>
            <option value="Compliance">Compliance</option>
            <option value="Reduction Program">Reduction Program</option>
            <option value="Supplier Engagement">Supplier Engagement</option>
          </select>
          {errors.scopeType?.message ? (
            <p className="text-sm font-medium text-error">
              {errors.scopeType.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800 dark:text-scope-text">
            Priority
          </label>
          <select
            className={cn(
              "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 dark:bg-scope-surface dark:text-scope-text",
              "outline-none transition-colors",
              "focus:border-scope-primary focus:ring-2 focus:ring-scope-primary/30",
              errors.priority ? "border-error" : "border-slate-300 dark:border-scope-border",
            )}
            {...register("priority")}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          {errors.priority?.message ? (
            <p className="text-sm font-medium text-error">
              {errors.priority.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800 dark:text-scope-text">
          Scope Description
        </label>
        <textarea
          rows={4}
          placeholder="Describe goals, deliverables, and stakeholders."
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 dark:bg-scope-surface dark:text-scope-text",
            "placeholder:text-slate-400 dark:placeholder:text-scope-textMuted/80",
            "outline-none transition-colors",
            "focus:border-scope-primary focus:ring-2 focus:ring-scope-primary/30",
            errors.description ? "border-error" : "border-slate-300 dark:border-scope-border",
          )}
          {...register("description")}
        />
        {errors.description?.message ? (
          <p className="text-sm font-medium text-error">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Create Scope"}
        </Button>
      </div>
    </form>
  );
}
