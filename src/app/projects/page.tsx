"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import CreateScopeForm from "@/components/scopes/CreateScopeForm";
import CreateSpendForm from "@/components/scopes/CreateSpendForm";
import EditSupplierForm from "@/components/scopes/EditSupplierForm";
import CsvUploader from "@/components/scopes/CsvUploader";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, SlideOver } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import type { SupplierRead } from "@/types/api";

type ApiErrorResponse = {
  detail?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail || fallback;
  }

  return fallback;
}

function disclosureBadge(hasDisclosure: boolean) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        hasDisclosure ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
      }`}
    >
      {hasDisclosure ? "Yes" : "No"}
    </span>
  );
}

export default function ProjectsPage() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const [suppliers, setSuppliers] = useState<SupplierRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupplierPanelOpen, setIsSupplierPanelOpen] = useState(false);
  const [isSpendPanelOpen, setIsSpendPanelOpen] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isCsvPanelOpen, setIsCsvPanelOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRead | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<SupplierRead | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<SupplierRead[]>("/suppliers/");
      setSuppliers(response.data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const columns: DataTableColumn<SupplierRead>[] = useMemo(
    () => [
      {
        key: "supplier_name",
        header: "Supplier",
        sortable: true,
        accessor: (row) => (
          <Link
            href={`/projects/${row.id}`}
            className="rounded-sm font-medium text-scope-primary hover:text-scope-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary"
          >
            {row.supplier_name}
          </Link>
        ),
      },
      {
        key: "domain",
        header: "Domain",
        sortable: true,
        accessor: (row) => row.domain || "N/A",
      },
      {
        key: "region",
        header: "Region",
        sortable: true,
        accessor: (row) => row.region || "N/A",
      },
      {
        key: "sbti_status",
        header: "SBTi Status",
        sortable: true,
        accessor: (row) => row.sbti_status || "N/A",
      },
      {
        key: "has_disclosure",
        header: "Has Disclosure",
        sortable: true,
        accessor: (row) => disclosureBadge(row.has_disclosure),
        sortValue: (row) => (row.has_disclosure ? 1 : 0),
      },
      {
        key: "actions",
        header: "Actions",
        accessor: (row) => (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              aria-label={`Edit ${row.supplier_name}`}
              title="Edit supplier"
              onClick={() => {
                setSelectedSupplier(row);
                setIsEditPanelOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              aria-label={`Delete ${row.supplier_name}`}
              title="Delete supplier"
              onClick={() => setSupplierToDelete(row)}
            >
              <Trash2 className="h-4 w-4 text-error" />
            </Button>
          </div>
        ),
      },
    ],
    [fetchSuppliers, toast],
  );

  function handleSupplierCreated() {
    setIsSupplierPanelOpen(false);
    fetchSuppliers();
  }

  function handleSpendCreated() {
    setIsSpendPanelOpen(false);
    fetchSuppliers();
  }

  function handleSupplierUpdated() {
    setIsEditPanelOpen(false);
    setSelectedSupplier(null);
    fetchSuppliers();
  }

  function handleCsvImported() {
    setIsCsvPanelOpen(false);
    fetchSuppliers();
  }

  async function handleConfirmDelete() {
    if (!supplierToDelete) return;
    try {
      await api.delete(`/suppliers/${supplierToDelete.id}`);
      toast.success("Supplier deleted", `${supplierToDelete.supplier_name} has been removed.`);
      fetchSuppliers();
    } catch (error: unknown) {
      toast.error("Delete failed", getErrorMessage(error, "Could not delete supplier."));
    } finally {
      setSupplierToDelete(null);
    }
  }

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.supplier_name.toLowerCase().includes(query) ||
    supplier.industry_locked.toLowerCase().includes(query),
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-scope-text">Suppliers & Spend</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-scope-textMuted">
            Manage supplier profiles and create spend records tied to procurement activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsSupplierPanelOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
          <Button variant="outline" onClick={() => setIsSpendPanelOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Spend
          </Button>
          <Button variant="outline" onClick={() => setIsCsvPanelOpen(true)}>
            Import CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Registry</CardTitle>
          <CardDescription>
            Live supplier records from `/suppliers/`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filteredSuppliers}
            rowKey={(row) => row.id}
            pageSize={8}
            loading={isLoading}
            emptyMessage="No suppliers found. Add your first supplier to get started."
          />
        </CardContent>
      </Card>

      <SlideOver
        open={isSupplierPanelOpen}
        title="Create Supplier"
        description="Map supplier profile data to the backend SupplierCreate schema."
        onClose={() => setIsSupplierPanelOpen(false)}
      >
        <CreateScopeForm
          onCreated={handleSupplierCreated}
          onCancel={() => setIsSupplierPanelOpen(false)}
        />
      </SlideOver>

      <SlideOver
        open={isSpendPanelOpen}
        title="Create Spend Record"
        description="Capture procurement spend and map it to spend categories."
        onClose={() => setIsSpendPanelOpen(false)}
      >
        <CreateSpendForm
          suppliers={suppliers}
          onCreated={handleSpendCreated}
          onCancel={() => setIsSpendPanelOpen(false)}
        />
      </SlideOver>

      <SlideOver
        open={isEditPanelOpen}
        title="Update Supplier"
        description="Edit supplier attributes and sync updates to the backend."
        onClose={() => {
          setIsEditPanelOpen(false);
          setSelectedSupplier(null);
        }}
      >
        <EditSupplierForm
          supplier={selectedSupplier}
          onSaved={handleSupplierUpdated}
          onCancel={() => {
            setIsEditPanelOpen(false);
            setSelectedSupplier(null);
          }}
        />
      </SlideOver>

      <SlideOver
        open={isCsvPanelOpen}
        title="Import ERP CSV"
        description="Upload bulk ERP spend data for ingestion."
        onClose={() => setIsCsvPanelOpen(false)}
      >
        <CsvUploader
          onUploaded={handleCsvImported}
          onCancel={() => setIsCsvPanelOpen(false)}
        />
      </SlideOver>

      {supplierToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-scope-border dark:bg-scope-surface">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-scope-text">Delete Supplier</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-scope-textMuted">
              Are you sure you want to delete &quot;{supplierToDelete.supplier_name}&quot;? All associated spend records will also be removed. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSupplierToDelete(null)}>Cancel</Button>
              <Button className="bg-error text-white hover:bg-error/90 dark:bg-error dark:text-white dark:hover:bg-error/90" onClick={handleConfirmDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
