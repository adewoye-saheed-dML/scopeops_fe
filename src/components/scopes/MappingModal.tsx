"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Button, Input, SlideOver } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

interface CedaCategory {
  id: string;
  name: string;
}

type MappingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  rawCategory: string;
  onSuccess: (updatedCount: number) => void;
};

export default function MappingModal({
  isOpen,
  onClose,
  rawCategory,
  onSuccess,
}: MappingModalProps) {
  const toast = useToast();
  const [cedaCategories, setCedaCategories] = useState<CedaCategory[]>([]);
  const [selectedCedaCode, setSelectedCedaCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    async function fetchCategories() {
      setIsLoadingCategories(true);
      setLoadError(null);

      try {
        const response = await api.get("/categories");
        const data = Array.isArray(response.data) ? response.data : [];
        if (isMounted) {
          setCedaCategories(data);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError("Unable to load category list. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    }

    fetchCategories();
    setSelectedCedaCode("");

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCedaCode) {
      toast.error("Select a CEDA category", "Please choose a category before saving.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/emission-factors/map-category", {
        raw_category: rawCategory,
        ceda_sector_code: selectedCedaCode,
      });

      const updatedCount = response.data?.records_updated ?? 0;
      toast.success("Mapping saved", `${updatedCount} record${updatedCount === 1 ? "" : "s"} updated.`);
      onSuccess(updatedCount);
      onClose();
    } catch (error: unknown) {
      toast.error(
        "Mapping failed",
        getErrorMessage(error, "Unable to save the mapping. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SlideOver
      open={isOpen}
      onClose={onClose}
      title="Map ERP Category"
      description="Assign a standard CEDA sector code to this raw ERP category."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label="Your ERP Category" value={rawCategory} disabled />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800 dark:text-scope-text">
            CEDA Category
          </label>
          <select
            className={cn(
              "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 dark:bg-scope-surface dark:text-scope-text",
              "outline-none transition-colors",
              "focus:border-scope-primary focus:ring-2 focus:ring-scope-primary/30",
              loadError ? "border-error" : "border-slate-300 dark:border-scope-border",
            )}
            value={selectedCedaCode}
            onChange={(event) => setSelectedCedaCode(event.target.value)}
            disabled={isLoadingCategories || isSubmitting}
          >
            <option value="">Select CEDA category</option>
            {cedaCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {isLoadingCategories ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-scope-textMuted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading CEDA categories...
            </div>
          ) : null}
          {loadError ? <p className="text-sm font-medium text-error">{loadError}</p> : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedCedaCode || isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Mapping"
            )}
          </Button>
        </div>
      </form>
    </SlideOver>
  );
}
