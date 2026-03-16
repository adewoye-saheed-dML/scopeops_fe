"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, use } from "react";
import { ChevronRight, LineChart, Globe } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "@/lib/api";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import StatCard from "@/components/dashboard/StatCard";
import type { SupplierRead } from "@/types/api";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

type PlaceholderSpendRecord = {
  id: string;
  category_code: string;
  fiscal_year: string;
  spend_amount: string;
  calculated_co2e: string;
  calculated_scope_1?: string | number;
  calculated_scope_2?: string | number;
  calculated_scope_3?: string | number;
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
  const { id: supplierId } = use(params);
  const [supplier, setSupplier] = useState<SupplierRead | null>(null);
  const [spendRecords, setSpendRecords] = useState<PlaceholderSpendRecord[]>([]);
  const { totalSpend, totalEmissions, totalScope1, totalScope2, totalScope3 } = useMemo(() => {
    return spendRecords.reduce((acc, record) => ({
      totalSpend: acc.totalSpend + (Number(record.spend_amount) || 0),
      totalEmissions: acc.totalEmissions + (Number(record.calculated_co2e) || 0),
      totalScope1: acc.totalScope1 + (Number(record.calculated_scope_1) || 0),
      totalScope2: acc.totalScope2 + (Number(record.calculated_scope_2) || 0),
      totalScope3: acc.totalScope3 + (Number(record.calculated_scope_3) || 0),
    }), { totalSpend: 0, totalEmissions: 0, totalScope1: 0, totalScope2: 0, totalScope3: 0 });
  }, [spendRecords]);

  const totalScopeEmissions = totalScope1 + totalScope2 + totalScope3;
  const scope1Percentage = totalScopeEmissions > 0 ? (totalScope1 / totalScopeEmissions) * 100 : 0;
  const scope2Percentage = totalScopeEmissions > 0 ? (totalScope2 / totalScopeEmissions) * 100 : 0;
  const scope3Percentage = totalScopeEmissions > 0 ? (totalScope3 / totalScopeEmissions) * 100 : 0;
  const scopeData = [
    { name: "Scope 1", value: totalScope1, fill: "#2563eb" },
    { name: "Scope 2", value: totalScope2, fill: "#7c3aed" },
    { name: "Scope 3", value: totalScope3, fill: "#6ee7b7" },
  ].filter(item => item.value > 0);

  const chartData = useMemo(() => {
    const categoryMap = spendRecords.reduce((acc, record) => {
      const category = record.category_code || "Unknown";
      const spend = Number(record.spend_amount) || 0;
      acc[category] = (acc[category] || 0) + spend;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryMap)
      .map(([name, spend]) => ({ name, spend }))
      .sort((a, b) => b.spend - a.spend);
  }, [spendRecords]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setHasError(false);
      try {
        const [supplierRes, spendRes] = await Promise.all([
          api.get<SupplierRead[]>("/suppliers/"),
          api.get<PlaceholderSpendRecord[]>(`/spend/?supplier_id=${supplierId}`),
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
          href="/suppliers"
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
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Total Supplier Spend"
          value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalSpend)}
          icon={LineChart}
          description="Total spend recorded for this supplier"
          trendValue="0%"
          trendDirection="up"
        />
        <StatCard
          title="Total Supplier Emissions"
          value={`${totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO2e`}
          icon={Globe}
          description="Total calculated emissions for this supplier"
          trendValue="0%"
          trendDirection="up"
        />
      </div>

      {chartData.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Spend by Category</CardTitle>
              <CardDescription>Breakdown of total spend allocated across different categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      cursor={{ fill: "#f1f5f9" }}
                      formatter={(value: number) => [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value), "Total Spend"]}
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                    <Bar dataKey="spend" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Scope Breakdown</CardTitle>
              <CardDescription>Share of Scope 1, Scope 2, and Scope 3 for this supplier.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="relative flex h-64 w-full items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scopeData}
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {scopeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} className="transition-all duration-300 hover:opacity-80" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO2e`, "Emissions"]}
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900 dark:text-scope-text">
                    {totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-scope-textMuted">Total (tCO2e)</span>
                </div>
              </div>
              <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center text-xs sm:text-sm">
                <div>
                  <span className="mb-1 block h-3 w-3 mx-auto rounded-full bg-[#2563eb]" />
                  <span className="text-slate-600 dark:text-scope-textMuted font-medium">Scope 1</span>
                  <span className="block text-slate-500 dark:text-scope-textMuted">{scope1Percentage.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="mb-1 block h-3 w-3 mx-auto rounded-full bg-[#7c3aed]" />
                  <span className="text-slate-600 dark:text-scope-textMuted font-medium">Scope 2</span>
                  <span className="block text-slate-500 dark:text-scope-textMuted">{scope2Percentage.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="mb-1 block h-3 w-3 mx-auto rounded-full bg-[#6ee7b7]" />
                  <span className="text-slate-600 dark:text-scope-textMuted font-medium">Scope 3</span>
                  <span className="block text-slate-500 dark:text-scope-textMuted">{scope3Percentage.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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





































