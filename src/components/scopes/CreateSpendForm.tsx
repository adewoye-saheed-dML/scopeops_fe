"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import type { SpendCreate, SpendRead, SupplierRead } from "@/types/api";

const spendSchema = z.object({
  supplier_id: z.string().uuid("Supplier is required."),
  category_code: z.string().min(1, "Category code is required."),
  fiscal_year: z.coerce.number().int().min(2000).max(2100),
  spend_amount: z.string().optional(),
  currency: z.string().optional(),
  quantity: z.string().optional(),
  unit_of_measure: z.string().optional(),
  material_type: z.string().optional(),
  factor_used_id: z.string().uuid("Factor ID must be a valid UUID.").optional().or(z.literal("")),
});

type CreateSpendValues = z.infer<typeof spendSchema>;

type ApiErrorResponse = {
  detail?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail || fallback;
  }

  return fallback;
}

type CreateSpendFormProps = {
  suppliers: SupplierRead[];
  onCreated: (spend: SpendRead) => void;
  onCancel: () => void;
};

function optionalValue(value: string | undefined) {
  if (!value || value.trim() === "") {
    return undefined;
  }

  return value.trim();
}

export default function CreateSpendForm({ suppliers, onCreated, onCancel }: CreateSpendFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSpendValues>({
    resolver: zodResolver(spendSchema),
    defaultValues: {
      supplier_id: "",
      category_code: "",
      fiscal_year: new Date().getFullYear(),
      spend_amount: "",
      currency: "USD",
      quantity: "",
      unit_of_measure: "",
      material_type: "",
      factor_used_id: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);

    const payload: SpendCreate = {
      supplier_id: values.supplier_id,
      category_code: values.category_code.trim(),
      fiscal_year: values.fiscal_year,
      spend_amount: optionalValue(values.spend_amount),
      currency: optionalValue(values.currency),
      quantity: optionalValue(values.quantity),
      unit_of_measure: optionalValue(values.unit_of_measure),
      material_type: optionalValue(values.material_type),
      factor_used_id: optionalValue(values.factor_used_id),
    };

    try {
      const response = await api.post<SpendRead>("/spend/", payload);
      onCreated(response.data);
      toast.success("Spend record created", `Category ${response.data.category_code} was added.`);
      reset({
        supplier_id: "",
        category_code: "",
        fiscal_year: new Date().getFullYear(),
        spend_amount: "",
        currency: "USD",
        quantity: "",
        unit_of_measure: "",
        material_type: "",
        factor_used_id: "",
      });
    } catch (error: unknown) {
      toast.error(
        "Spend creation failed",
        getErrorMessage(error, "Please check the spend data and try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800 dark:text-scope-text">
          Supplier
        </label>
        <select
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 dark:bg-scope-surface dark:text-scope-text",
            "outline-none transition-colors",
            "focus:border-scope-primary focus:ring-2 focus:ring-scope-primary/30",
            errors.supplier_id ? "border-error" : "border-slate-300 dark:border-scope-border",
          )}
          {...register("supplier_id")}
        >
          <option value="">Select supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.supplier_name}
            </option>
          ))}
        </select>
        {errors.supplier_id?.message ? (
          <p className="text-sm font-medium text-error">{errors.supplier_id.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Category Code"
          placeholder="IT_SERVICES"
          error={errors.category_code?.message}
          {...register("category_code")}
        />
        <Input
          type="number"
          label="Fiscal Year"
          error={errors.fiscal_year?.message}
          {...register("fiscal_year")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          type="number"
          step="0.01"
          label="Spend Amount (Optional)"
          placeholder="10000"
          error={errors.spend_amount?.message}
          {...register("spend_amount")}
        />
        <Input
          label="Currency (Optional)"
          placeholder="USD"
          error={errors.currency?.message}
          {...register("currency")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          type="number"
          step="0.01"
          label="Quantity (Optional)"
          placeholder="500"
          error={errors.quantity?.message}
          {...register("quantity")}
        />
        <Input
          label="Unit of Measure (Optional)"
          placeholder="kg"
          error={errors.unit_of_measure?.message}
          {...register("unit_of_measure")}
        />
      </div>

      <Input
        label="Material Type (Optional)"
        placeholder="Aluminum"
        error={errors.material_type?.message}
        {...register("material_type")}
      />

      <Input
        label="Factor Used ID (Optional)"
        placeholder="UUID"
        error={errors.factor_used_id?.message}
        {...register("factor_used_id")}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Create Spend Record"}
        </Button>
      </div>
    </form>
  );
}
