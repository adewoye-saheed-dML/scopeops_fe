"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { SupplierRead } from "@/types/api";

type ProjectDetailPageProps = {
  params: {
    id: string;
  };
};

type PlaceholderSpendRecord = {
  id: string;
  category_code: string;
  fiscal_year: string;
  spend_amount: string;
  calculated_co2e: string;
};

function disclosureBadge(hasDisclosure: boolean) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        hasDisclosure ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
      }`}
    >
      SBTi Disclosure: {hasDisclosure ? "Yes" : "No"}
    </span>
  );
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const supplierId = params.id;
  const [supplier, setSupplier] = useState<SupplierRead | null>(null);
  const [spendRecords, setSpendRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setHasError(false);
      try {
        const [supplierRes, spendRes] = await Promise.all([
          api.get<SupplierRead[]>("/suppliers/"),
          api.get(`/spend/?supplier_id=${supplierId}`),
        ]);

        const matchedSupplier = (supplierRes.data ?? []).find((item) => item.id === supplierId) ?? null;
        setSupplier(matchedSupplier);
        setSpendRecords(spendRes.data ?? []);
      } catch {
        setHasError(true);
        setSupplier(null);
      } finally {
        setIsLoading(false);
      }
    }
    void loadData();
  }, [supplierId]);

  const spendColumns = useMemo<DataTableColumn<PlaceholderSpendRecord>[]>(
    () => [
      { key: "category_code", header: "Category", sortable: true },
      { key: "fiscal_year", header: "Fiscal Year", sortable: true },
      { key: "spend_amount", header: "Spend Amount", sortable: true },
      { key: "calculated_co2e", header: "Calculated CO2e", sortable: true },
    ],
    [],
  );


  return (
    <section className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-scope-textMuted">
        <Link
          href="/projects"
          className="rounded-sm px-1 py-0.5 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary dark:hover:text-scope-text"
        >
          Projects
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400 dark:text-scope-textMuted" />
        <span className="truncate text-slate-900 dark:text-scope-text">
          {supplier?.supplier_name || "Supplier Detail"}
        </span>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading ? "Loading supplier..." : supplier?.supplier_name || "Supplier not found"}
          </CardTitle>
          <CardDescription>
            {hasError
              ? "Could not load supplier details right now."
              : supplier
                ? `${supplier.industry_locked} - ${supplier.region || "Region not specified"}`
                : "We could not find a supplier with that ID."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-500 dark:text-scope-textMuted">
            Supplier ID: <span className="font-medium text-slate-700 dark:text-scope-text">{supplierId}</span>
          </div>
          {supplier ? disclosureBadge(supplier.has_disclosure) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spend Records</CardTitle>
          <CardDescription>
            Spend records will appear here once they are available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            title="Spend Records"
            columns={spendColumns}
            rows={spendRecords}
            rowKey={(row) => row.id}
            pageSize={8}
            loading={isLoading}
            emptyMessage="No spend records yet. Add spend to see it here."
          />
        </CardContent>
      </Card>
    </section>
  );
}




