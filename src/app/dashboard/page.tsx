"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Database, Globe, LineChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import StatCard from "@/components/dashboard/StatCard";
import ActivityChart from "@/components/dashboard/ActivityChart";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import api from "@/lib/api";

// 1. Define beautiful fallback demo data
type DashboardMetrics = {
  total_spend: number;
  total_co2e: number;
  record_count: number;
  coverage_percentage: number;
};

type SupplierRow = {
  id: string;
  supplier_name: string;
  category_code: string;
};
const DEMO_METRICS = {
  total_spend: 1017605,
  total_co2e: 28500,
  record_count: 142,
  coverage_percentage: 84
};

const DEMO_SUPPLIERS: SupplierRow[] = [
  { id: "demo-1", supplier_name: "Amazon Web Services", category_code: "CLOUD_SERVICES" },
  { id: "demo-2", supplier_name: "Dell Technologies", category_code: "IT_HARDWARE" },
  { id: "demo-3", supplier_name: "FedEx", category_code: "LOGISTICS_FREIGHT" },
  { id: "demo-4", supplier_name: "WeWork", category_code: "FACILITIES_RENT" },
  { id: "demo-5", supplier_name: "Salesforce", category_code: "SOFTWARE_SUBSCRIPTION" },
];
const DEMO_ACTIVITY = [
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
  const [metrics, setMetrics] = useState<DashboardMetrics>({ total_spend: 0, total_co2e: 0, record_count: 0, coverage_percentage: 0 });
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fetch real data from the database
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [summaryRes, suppliersRes] = await Promise.all([
          api.get<DashboardMetrics>("/spend/summary"),
          api.get<SupplierRow[]>("/suppliers/")
        ]);

        if (summaryRes.data) {
          setMetrics({
            total_spend: summaryRes.data.total_spend || 0,
            total_co2e: summaryRes.data.total_co2e || 0,
            record_count: summaryRes.data.record_count || 0,
            coverage_percentage: summaryRes.data.coverage_percentage || 0
          });
        }
        if (suppliersRes.data) {
          setSuppliers(suppliersRes.data.slice(0, 5)); // Grab top 5
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // 3. The "Intelligent Toggle" - If they have no records, show the demo!
  const hasRealData = metrics.record_count > 0 || suppliers.length > 0;
  const displayMetrics = hasRealData ? metrics : DEMO_METRICS;
  const displaySuppliers = hasRealData ? suppliers : DEMO_SUPPLIERS;

  const supplierColumns: DataTableColumn<SupplierRow>[] = [
    { key: "supplier_name", header: "Supplier Name" },
    { key: "category_code", header: "Primary Category" },
    {
      key: "actions",
      header: "",
      accessor: (row) => (
        row.id.startsWith("demo") ? (
          <span className="text-sm text-slate-400">Demo only</span>
        ) : (
          <Link href={`/projects/${row.id}`} className="text-scope-primary hover:text-scope-primaryHover text-sm font-medium">
            View Data &rarr;
          </Link>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-scope-text">Operational Overview</h1>
          <p className="text-sm text-slate-500 dark:text-scope-textMuted">Monitor activity velocity, approvals, and compliance in one view.</p>
        </div>
        {!hasRealData && !isLoading && (
          <div className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            Viewing Demo Data - Upload CSV to activate
          </div>
        )}
      </div>

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Top Suppliers Registry</CardTitle>
            <CardDescription>Click a supplier to view detailed spend and emissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={supplierColumns}
              rows={displaySuppliers}
              rowKey={(row) => row.id}
              pageSize={5}
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <ActivityChart data={DEMO_ACTIVITY} />
        </Card>
      </div>
    </div>
  );
}