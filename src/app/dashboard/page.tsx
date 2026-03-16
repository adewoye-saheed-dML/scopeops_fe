"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BarChart3, Database, Globe, LineChart, Download, Play, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui";
import StatCard from "@/components/dashboard/StatCard";
import ActivityChart from "@/components/dashboard/ActivityChart";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import api from "@/lib/api";
import { useToast } from "@/hooks/useToast";

type DashboardMetrics = {
  total_spend: number;
  total_co2e: number;
  total_scope_1: number;
  total_scope_2: number;
  total_scope_3: number;
  record_count: number;
  coverage_percentage: number;
};

type SupplierRow = {
  id: string;
  supplier_name: string;
  total_co2e: number;
};

type ActivityPoint = {
  month: string;
  activity: number;
};

const DEMO_METRICS: DashboardMetrics = {
  total_spend: 1017605,
  total_co2e: 28500,
  total_scope_1: 5000,
  total_scope_2: 10000,
  total_scope_3: 13500,
  record_count: 142,
  coverage_percentage: 84
};

const DEMO_SUPPLIERS: SupplierRow[] = [
  { id: "demo-1", supplier_name: "Amazon Web Services", total_co2e: 12500 },
  { id: "demo-2", supplier_name: "Dell Technologies", total_co2e: 8400 },
  { id: "demo-3", supplier_name: "FedEx", total_co2e: 15675 },
  { id: "demo-4", supplier_name: "WeWork", total_co2e: 4975 },
  { id: "demo-5", supplier_name: "Salesforce", total_co2e: 9820 },
];

const DEMO_ACTIVITY: ActivityPoint[] = [
  { month: "Jan", activity: 8 },
  { month: "Feb", activity: 12 },
  { month: "Mar", activity: 9 },
  { month: "Apr", activity: 14 },
  { month: "May", activity: 18 },
  { month: "Jun", activity: 16 },
  { month: "Jul", activity: 22 },
  { month: "Aug", activity: 19 },
  { month: "Sep", activity: 24 },
  { month: "Oct", activity: 21 },
  { month: "Nov", activity: 27 },
  { month: "Dec", activity: 23 },
];

export default function DashboardPage() {
  const { success, error } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_spend: 0,
    total_co2e: 0,
    total_scope_1: 0,
    total_scope_2: 0,
    total_scope_3: 0,
    record_count: 0,
    coverage_percentage: 0
  });
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [summaryRes, suppliersRes] = await Promise.all([
        api.get<DashboardMetrics>("/spend/summary"),
        api.get<SupplierRow[]>("/suppliers/dashboard-stats")
      ]);

      if (summaryRes.data) {
        setMetrics({
          total_spend: summaryRes.data.total_spend || 0,
          total_co2e: summaryRes.data.total_co2e || 0,
          total_scope_1: summaryRes.data.total_scope_1 || 0,
          total_scope_2: summaryRes.data.total_scope_2 || 0,
          total_scope_3: summaryRes.data.total_scope_3 || 0,
          record_count: summaryRes.data.record_count || 0,
          coverage_percentage: summaryRes.data.coverage_percentage || 0
        });
      }
      if (suppliersRes.data) {
        setSuppliers(suppliersRes.data.slice(0, 5));
      }
    } catch (errorValue) {
      console.error("Failed to fetch dashboard data:", errorValue);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleBatchCalculation = async () => {
    setIsCalculating(true);
    try {
      const res = await api.post("/spend/calculate");
      success("Calculation Complete", `Processed ${res.data.records_calculated || 0} records successfully.`);
      await fetchDashboardData();
    } catch {
      error("Calculation Failed", "Could not complete the batch calculation.");
    } finally {
      setIsCalculating(false);
    }
  };

  const hasRealData = metrics.record_count > 0 || suppliers.length > 0;
  const displayMetrics = hasRealData ? metrics : DEMO_METRICS;
  const displaySuppliers = hasRealData ? suppliers : DEMO_SUPPLIERS;
  const totalScopeEmissions = displayMetrics.total_scope_1 + displayMetrics.total_scope_2 + displayMetrics.total_scope_3;
  const scope1Percentage = totalScopeEmissions > 0 ? (displayMetrics.total_scope_1 / totalScopeEmissions) * 100 : 0;
  const scope2Percentage = totalScopeEmissions > 0 ? (displayMetrics.total_scope_2 / totalScopeEmissions) * 100 : 0;
  const scope3Percentage = totalScopeEmissions > 0 ? (displayMetrics.total_scope_3 / totalScopeEmissions) * 100 : 0;

  const supplierColumns: DataTableColumn<SupplierRow>[] = [
    { key: "supplier_name", header: "Supplier Name" },
    {
      key: "total_co2e",
      header: "Total Emissions (tCO2e)",
      accessor: (row) => row.total_co2e ? row.total_co2e.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "0"
    },
    {
      key: "actions",
      header: "",
      accessor: (row) => (
        row.id.startsWith("demo") ? (
          <span className="text-sm text-slate-400">Demo only</span>
        ) : (
          <Link href={`/suppliers/${row.id}`} className="text-scope-primary hover:text-scope-primaryHover text-sm font-medium">
            View Data &rarr;
          </Link>
        )
      )
    }
  ];

  const scopeData = [
    { name: "Scope 1", value: displayMetrics.total_scope_1, fill: "#2563eb" },
    { name: "Scope 2", value: displayMetrics.total_scope_2, fill: "#7c3aed" },
    { name: "Scope 3", value: displayMetrics.total_scope_3, fill: "#6ee7b7" },
  ].filter(item => item.value > 0);
  return (
    <div className="space-y-6">
      {/* HEADER & ACTION BUTTONS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-scope-text">Operational Overview</h1>
          <p className="text-sm text-slate-500 dark:text-scope-textMuted">Monitor activity velocity, approvals, and compliance in one view.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!hasRealData && !isLoading && (
            <div className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              Viewing Demo Data - Upload CSV to activate
            </div>
          )}
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline-block">Export Report</span>
          </Button>
          <Button size="sm" className="h-9 gap-2" onClick={handleBatchCalculation} disabled={isCalculating}>
            {isCalculating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            <span className="hidden sm:inline-block">Run Batch Calculation</span>
          </Button>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Spend"
          value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(displayMetrics.total_spend)}
          icon={LineChart}
          description="Current spend captured"
          trendValue="0%"
          trendDirection="up"
        />
        <StatCard
          title="Total Calculated CO2e"
          value={`${displayMetrics.total_co2e.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO2e`}
          icon={Globe}
          description="Calculated emissions"
          trendValue="0%"
          trendDirection="up"
        />
        <StatCard
          title="Spend Records"
          value={displayMetrics.record_count.toString()}
          icon={Database}
          description="Rows used for calculations"
          trendValue="0%"
          trendDirection="up"
        />
        <StatCard
          title="Coverage"
          value={`${Math.round(displayMetrics.coverage_percentage)}%`}
          icon={BarChart3}
          description="Spend mapped to valid factors"
          trendValue="0%"
          trendDirection="up"
        />
      </div>

      {/* TOP SUPPLIERS REGISTRY (Full Width) */}
      <Card>
        <CardHeader>
          <CardTitle>Top Suppliers Registry</CardTitle>
          <CardDescription>Click a supplier to view detailed spend and emissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={supplierColumns} rows={displaySuppliers} rowKey={(row) => row.id} pageSize={5} loading={isLoading} />
        </CardContent>
      </Card>

      {/* CHARTS GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <ActivityChart data={DEMO_ACTIVITY} />
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Scope Breakdown</CardTitle>
            <CardDescription>Exact share of Scope 1, Scope 2, and Scope 3 from summary totals.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="relative flex h-64 w-full items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scopeData}
                    innerRadius={80}
                    outerRadius={100}
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
                  {displayMetrics.total_co2e.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </span>
                <span className="block text-xs text-slate-500 dark:text-scope-textMuted">Total (tCO2e)</span>
              </div>
            </div>
            <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center text-sm">
              <div>
                <span className="mb-1 block h-3 w-3 mx-auto rounded-full bg-[#2563eb]" />
                <span className="text-slate-600 dark:text-scope-textMuted">
                  {`Scope 1 - ${scope1Percentage.toFixed(1)}% - ${displayMetrics.total_scope_1.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO2e`}
                </span>
              </div>
              <div>
                <span className="mb-1 block h-3 w-3 mx-auto rounded-full bg-[#7c3aed]" />
                <span className="text-slate-600 dark:text-scope-textMuted">
                  {`Scope 2 - ${scope2Percentage.toFixed(1)}% - ${displayMetrics.total_scope_2.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO2e`}
                </span>
              </div>
              <div>
                <span className="mb-1 block h-3 w-3 mx-auto rounded-full bg-[#6ee7b7]" />
                <span className="text-slate-600 dark:text-scope-textMuted">
                  {`Scope 3 - ${scope3Percentage.toFixed(1)}% - ${displayMetrics.total_scope_3.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO2e`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}








