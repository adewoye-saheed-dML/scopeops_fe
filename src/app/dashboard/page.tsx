"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Download,
  DollarSign,
  Leaf,
  Loader2,
} from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import api from "@/lib/api";
import { ActivityChart, StatCard } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/lib/errors";

type SpendSummary = {
  total_spend: number;
  total_emissions: number;
  total_scope_1: number;
  total_scope_2: number;
  total_scope_3: number;
  emission_intensity: number;
  records_calculated: number;
  records_uncalculated: number;
};
type SpendCoverage = {
  total_spend: number;
  covered_spend: number;
  coverage_percentage: number;
};
type ChartPoint = { month: string; activity: number };
type ScopeBreakdownPoint = { name: string; value: number; color: string };

const mockActivityData: ChartPoint[] = [
  { month: "Jan", activity: 12 },
  { month: "Feb", activity: 18 },
  { month: "Mar", activity: 16 },
  { month: "Apr", activity: 22 },
  { month: "May", activity: 27 },
  { month: "Jun", activity: 31 },
];


function formatCurrency(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactNumber(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  const normalized = value > 1 ? value : value * 100;
  return `${Math.round(normalized)}%`;
}

export default function DashboardPage() {
  const toast = useToast();
  const [summary, setSummary] = useState<SpendSummary | null>(null);
  const [coverage, setCoverage] = useState<SpendCoverage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const hasSeeded = useRef(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const [summaryResponse, coverageResponse] = await Promise.all([
        api.get<SpendSummary>("/spend/summary"),
        api.get<SpendCoverage>("/spend/coverage"),
      ]);

      const summaryData = summaryResponse.data;
      const coverageData = coverageResponse.data;

      setSummary(summaryData);
      setCoverage(coverageData);
    } catch {
      setHasError(true);
      setSummary(null);
      setCoverage(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  async function handleRunBatchCalculation() {
    setIsCalculating(true);
    try {
      await api.post("/spend/calculate");
      toast.success("Batch calculation complete", "Spend emissions were recalculated.");
      await loadDashboardData();
    } catch (error: unknown) {
      toast.error("Batch calculation failed", getErrorMessage(error, "Could not run batch calculation."));
    } finally {
      setIsCalculating(false);
    }
  }

  function handleExport() {
    if (!summary) {
      toast.error("Export failed", "Summary data is not available yet.");
      return;
    }

    const csvRows = [
      ["Metric", "Value"],
      ["Total Spend", String(summary.total_spend ?? 0)],
      ["Total Emissions", String(summary.total_emissions ?? 0)],
      ["Scope 1", String(summary.total_scope_1 ?? 0)],
      ["Scope 2", String(summary.total_scope_2 ?? 0)],
      ["Scope 3", String(summary.total_scope_3 ?? 0)],
    ];

    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, "\"\"")}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "scopeops_summary_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  const statCards = useMemo(() => {
    const totalSpend = summary?.total_spend ?? null;
    const totalEmissions = summary?.total_emissions ?? null;
    const spendRecords = summary?.records_calculated ?? null;
    const coveragePercent = coverage?.coverage_percentage ?? null;

    return [
      {
        title: "Total Spend",
        value: formatCurrency(totalSpend),
        trendValue: totalSpend === null ? "N/A" : "Live",
        trendDirection: "up" as const,
        description: "Current spend captured in the platform",
        icon: DollarSign,
      },
      {
        title: "Total Calculated CO2e",
        value: totalEmissions === null ? "N/A" : `${formatCompactNumber(totalEmissions)} tCO2e`,
        trendValue: totalEmissions === null ? "N/A" : "Live",
        trendDirection: "up" as const,
        description: "Calculated emissions from spend records",
        icon: Leaf,
      },
      {
        title: "Spend Records",
        value: formatCompactNumber(spendRecords),
        trendValue: spendRecords === null ? "N/A" : "Live",
        trendDirection: "up" as const,
        description: "Rows currently used for carbon calculations",
        icon: ClipboardList,
      },
      {
        title: "Coverage",
        value: formatPercent(coveragePercent),
        trendValue: coveragePercent === null ? "N/A" : "Live",
        trendDirection: "up" as const,
        description: "Portion of spend mapped to valid factors",
        icon: CheckCircle2,
      },
    ];
  }, [coverage, summary]);
  const scopeBreakdownData = useMemo<ScopeBreakdownPoint[]>(
    () => [
      {
        name: "Scope 1",
        value: summary?.total_scope_1 ?? 0,
        color: "#f97316",
      },
      {
        name: "Scope 2",
        value: summary?.total_scope_2 ?? 0,
        color: "#22c55e",
      },
      {
        name: "Scope 3",
        value: summary?.total_scope_3 ?? 0,
        color: "#3b82f6",
      },
    ],
    [summary?.total_scope_1, summary?.total_scope_2, summary?.total_scope_3],
  );
  const hasScopeData = scopeBreakdownData.some((scope) => scope.value > 0);

  const totalSpend = summary?.total_spend ?? 0;
  const shouldShowSeedingState = isSeedingDemo;

  useEffect(() => {
    async function seedDemoData() {
      if (isLoading || hasError || totalSpend !== 0 || hasSeeded.current) {
        return;
      }

      hasSeeded.current = true;
      setIsSeedingDemo(true);

      try {
        await api.post("/spend/seed-demo-data");
        await loadDashboardData();
      } catch (error: unknown) {
        toast.error("Demo setup failed", getErrorMessage(error, "Could not generate onboarding demo data."));
      } finally {
        setIsSeedingDemo(false);
      }
    }

    void seedDemoData();
  }, [hasError, isLoading, loadDashboardData, toast, totalSpend]);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-scope-text">
            Operational Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-scope-textMuted">
            Monitor activity velocity, approvals, and compliance in one view.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading dashboard...</CardTitle>
            <CardDescription>Loading spend summary and coverage.</CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-scope-text">
              Operational Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-scope-textMuted">
              Monitor activity velocity, approvals, and compliance in one view.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!summary}>
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button onClick={handleRunBatchCalculation} disabled={isCalculating}>
              {isCalculating ? "Running..." : "Run Batch Calculation"}
            </Button>
          </div>
        </div>
      </div>

      {hasError ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load dashboard data</CardTitle>
            <CardDescription>
              We could not load spend summary or coverage right now.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : shouldShowSeedingState ? (
        <Card>
          <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-scope-primary" />
            <div>
              <p className="text-base font-medium text-slate-900 dark:text-scope-text">
                Setting up your intelligent workspace...
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-scope-textMuted">
                Generating sample suppliers and analyzing simulated spend...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <ActivityChart data={mockActivityData} />
            </div>
            <div className="xl:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Scope Breakdown</CardTitle>
                  <CardDescription>
                    Exact share of Scope 1, Scope 2, and Scope 3 from summary totals.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasScopeData ? (
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={scopeBreakdownData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={64}
                            outerRadius={92}
                            paddingAngle={2}
                          >
                            {scopeBreakdownData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${Number(value).toFixed(2)} tCO2e`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex h-72 items-center justify-center text-sm text-slate-500 dark:text-scope-textMuted">
                      No scope emissions data yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}






