"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import type { SupplierCreate, SupplierRead } from "@/types/api";
import { getErrorMessage } from "@/lib/errors";

const supplierSchema = z.object({
  supplier_name: z.string().min(2, "Supplier name is required."),
  industry_locked: z.string().min(2, "Industry is required."),
  domain: z.string().optional(),
  region: z.string().optional(),
  sbti_status: z.string().optional(),
  parent_id: z.string().uuid("Parent ID must be a valid UUID.").optional().or(z.literal("")),
});

export type CreateSupplierValues = z.infer<typeof supplierSchema>;



type CreateScopeFormProps = {
  onCreated: (supplier: SupplierRead) => void;
  onCancel: () => void;
};

function optionalOrNull(value: string | undefined) {
  if (!value || value.trim() === "") {
    return null;
  }

  return value.trim();
}

export default function CreateScopeForm({ onCreated, onCancel }: CreateScopeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSupplierValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supplier_name: "",
      industry_locked: "",
      domain: "",
      region: "",
      sbti_status: "",
      parent_id: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);

    const payload: SupplierCreate = {
      supplier_name: values.supplier_name.trim(),
      industry_locked: values.industry_locked.trim(),
      domain: optionalOrNull(values.domain),
      region: optionalOrNull(values.region),
      sbti_status: optionalOrNull(values.sbti_status),
      parent_id: optionalOrNull(values.parent_id),
    };

    try {
      const response = await api.post<SupplierRead>("/suppliers/", payload);
      onCreated(response.data);
      toast.success("Supplier created", `${response.data.supplier_name} has been added.`);
      reset();
    } catch (error: unknown) {
      toast.error(
        "Supplier creation failed",
        getErrorMessage(error, "Please check the input fields and try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Supplier Name"
        placeholder="Acme Components Ltd."
        error={errors.supplier_name?.message}
        {...register("supplier_name")}
      />

      <Input
        label="Industry"
        placeholder="Manufacturing"
        error={errors.industry_locked?.message}
        {...register("industry_locked")}
      />

      <Input
        label="Domain (Optional)"
        placeholder="acme.com"
        error={errors.domain?.message}
        {...register("domain")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Region (Optional)"
          placeholder="North America"
          error={errors.region?.message}
          {...register("region")}
        />
        <Input
          label="SBTi Status (Optional)"
          placeholder="Committed"
          error={errors.sbti_status?.message}
          {...register("sbti_status")}
        />
      </div>

      <Input
        label="Parent Supplier ID (Optional)"
        placeholder="Paste supplier ID"
        error={errors.parent_id?.message}
        {...register("parent_id")}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Create Supplier"}
        </Button>
      </div>
    </form>
  );
}





