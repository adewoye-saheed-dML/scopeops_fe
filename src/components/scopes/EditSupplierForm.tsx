"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import type { SupplierRead } from "@/types/api";

const supplierUpdateSchema = z.object({
  supplier_name: z.string().min(2, "Supplier name is required."),
  industry_locked: z.string().min(2, "Industry is required."),
  domain: z.string().optional(),
  region: z.string().optional(),
  sbti_status: z.string().optional(),
  parent_id: z.string().uuid("Parent ID must be a valid UUID.").optional().or(z.literal("")),
});

type EditSupplierValues = z.infer<typeof supplierUpdateSchema>;

type EditSupplierFormProps = {
  supplier: SupplierRead | null;
  onSaved: (supplier: SupplierRead) => void;
  onCancel: () => void;
};

type ApiErrorResponse = {
  detail?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail || fallback;
  }

  return fallback;
}

function optionalOrNull(value: string | undefined) {
  if (!value || value.trim() === "") {
    return null;
  }

  return value.trim();
}

export default function EditSupplierForm({ supplier, onSaved, onCancel }: EditSupplierFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditSupplierValues>({
    resolver: zodResolver(supplierUpdateSchema),
    defaultValues: {
      supplier_name: "",
      industry_locked: "",
      domain: "",
      region: "",
      sbti_status: "",
      parent_id: "",
    },
  });

  useEffect(() => {
    if (!supplier) {
      return;
    }

    reset({
      supplier_name: supplier.supplier_name,
      industry_locked: supplier.industry_locked,
      domain: supplier.domain ?? "",
      region: supplier.region ?? "",
      sbti_status: supplier.sbti_status ?? "",
      parent_id: supplier.parent_id ?? "",
    });
  }, [reset, supplier]);

  const onSubmit = handleSubmit(async (values) => {
    if (!supplier) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.patch<SupplierRead>(`/suppliers/${supplier.id}`, {
        supplier_name: values.supplier_name.trim(),
        industry_locked: values.industry_locked.trim(),
        domain: optionalOrNull(values.domain),
        region: optionalOrNull(values.region),
        sbti_status: optionalOrNull(values.sbti_status),
        parent_id: optionalOrNull(values.parent_id),
      });
      onSaved(response.data);
      toast.success("Supplier updated", `${response.data.supplier_name} was updated.`);
    } catch (error: unknown) {
      toast.error("Supplier update failed", getErrorMessage(error, "Could not update supplier."));
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
        placeholder="UUID"
        error={errors.parent_id?.message}
        {...register("parent_id")}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !supplier}>
          {isSubmitting ? "Saving..." : "Update Supplier"}
        </Button>
      </div>
    </form>
  );
}
