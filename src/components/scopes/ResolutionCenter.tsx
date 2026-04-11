"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import api from "@/lib/api";
import DataTable, { type DataTableColumn } from "@/components/data-table";
import { Button } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import MappingModal from "@/components/scopes/MappingModal";

interface PendingRecord {
  id: string;
  supplier_id: string;
  category_code: string;
  spend_amount: number;
  currency: string;
  calculation_method: string;
}

export default function ResolutionCenter() {
  const toast = useToast();
  const [records, setRecords] = useState<PendingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRawCategory, setSelectedRawCategory] = useState("");
  const isMountedRef = useRef(true);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.get("/spend/");
      const data = Array.isArray(response.data) ? response.data : [];
      if (isMountedRef.current) {
        setRecords(data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setErrorMessage("Unable to load spend records. Please try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchRecords();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchRecords]);

  const pendingRecords = useMemo(
    () => records.filter((record) => record.calculation_method === "Requires_Mapping"),
    [records],
  );

  const columns = useMemo<DataTableColumn<PendingRecord>[]>(
    () => [
      {
        key: "id",
        header: "Record ID",
        accessor: (row) => row.id,
      },
      {
        key: "category_code",
        header: "Reported Category",
        accessor: (row) => row.category_code,
      },
      {
        key: "spend_amount",
        header: "Spend Amount",
        accessor: (row) => `${row.currency} ${row.spend_amount.toLocaleString()}`,
        sortValue: (row) => row.spend_amount,
      },
      {
        key: "action",
        header: "Action",
        accessor: (row) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedRawCategory(row.category_code);
              setIsModalOpen(true);
            }}
          >
            Map Data
          </Button>
        ),
      },
    ],
    [setIsModalOpen, setSelectedRawCategory],
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-scope-text">
          Data Resolution Center
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-scope-textMuted">
          {pendingRecords.length} record{pendingRecords.length === 1 ? "" : "s"} need attention.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 dark:border-scope-border dark:bg-scope-surface/40 dark:text-scope-textMuted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading spend records...
        </div>
      ) : errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : pendingRecords.length === 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5" />
          <div>
            <p className="text-sm font-semibold">
              All data mapped successfully. No pending resolutions.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="text-sm font-semibold">
                {pendingRecords.length} record{pendingRecords.length === 1 ? "" : "s"} require mapping.
              </p>
              <p className="mt-1 text-sm text-amber-900/80">
                Review each entry and map it to a standardized category.
              </p>
            </div>
          </div>

          <DataTable
            title="Pending Records"
            columns={columns}
            rows={pendingRecords}
            rowKey={(row) => row.id}
            pageSize={8}
            loading={isLoading}
            emptyMessage="No records awaiting mapping."
          />
        </div>
      )}

      <MappingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rawCategory={selectedRawCategory}
        onSuccess={(updatedCount) => {
          toast.success(`Successfully mapped and calculated ${updatedCount} records!`);
          fetchRecords();
        }}
      />
    </section>
  );
}
