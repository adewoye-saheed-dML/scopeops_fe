"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import {
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Leaf,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { ActivityChart, RecentActivityFeed, StatCard } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui";
import { useToast } from "@/hooks/useToast";

type ApiRecord = Record<string, unknown>;
type ChartPoint = { month: string; activity: number };
type ApiErrorResponse = { detail?: string };

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail || fallback;
  }

  return fallback;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function pickNumericByKeys(data: ApiRecord, keys: string[]): number | null {
  const loweredKeys = keys.map((key) => key.toLowerCase());

  for (const [key, value] of Object.entries(data)) {
    const normalized = key.toLowerCase();
    if (loweredKeys.some((k) => normalized.includes(k))) {
      const numericValue = toNumber(value);
      if (numericValue !== null) {
        return numericValue;
      }
    }
  }

  return null;
}

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

function mapToChartPoints(data: unknown): ChartPoint[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as ApiRecord;
      const monthRaw = row.month ?? row.period ?? row.label ?? row.name ?? row.date;
      const amountRaw = row.activity ?? row.co2e ?? row.emissions ?? row.spend ?? row.total ?? row.value;

      const amount = toNumber(amountRaw);
      if (!monthRaw || amount === null) {
        return null;
      }

      return {
        month: String(monthRaw),
        activity: amount,
      };
    })
    .filter((point): point is ChartPoint => point !== null);
}

const recentActivities = [
  {
    id: "1",
    user: "Ava Patel",
    action: "approved baseline for",
    target: "Scope 3 - Logistics",
    timestamp: "5 minutes ago",
  },
  {
    id: "2",
    user: "Marcus Reed",
    action: "submitted supplier evidence in",
    target: "Project Terra",
    timestamp: "18 minutes ago",
  },
  {
    id: "3",
    user: "Nina Kim",
    action: "updated emission factor set for",
    target: "North America Region",
    timestamp: "43 minutes ago",
  },
  {
    id: "4",
    user: "Leo Santos",
    action: "closed approval task in",
    target: "Q1 Procurement Audit",
    timestamp: "1 hour ago",
  },
];

export default function DashboardPage() {
  const toast = useToast();
  const [summary, setSummary] = useState<ApiRecord | null>(null);
  const [coverage, setCoverage] = useState<ApiRecord | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const hasSeededRef = useRef(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const [summaryResponse, coverageResponse] = await Promise.all([
        api.get<ApiRecord>("/spend/summary"),
        api.get<ApiRecord>("/spend/coverage"),
      ]);

      const summaryData = summaryResponse.data ?? {};
      const coverageData = coverageResponse.data ?? {};

      const summarySeries = mapToChartPoints(
        (summaryData.trend as unknown) ??
          (summaryData.history as unknown) ??
          (summaryData.by_month as unknown) ??
          (summaryData.monthly as unknown),
      );
      const coverageSeries = mapToChartPoints(
        (coverageData.trend as unknown) ??
          (coverageData.history as unknown) ??
          (coverageData.by_month as unknown) ??
          (coverageData.monthly as unknown),
      );

      setSummary(summaryData);
      setCoverage(coverageData);
      setChartData(summarySeries.length > 0 ? summarySeries : coverageSeries);
    } catch {
      setHasError(true);
      setSummary(null);
      setCoverage(null);
      setChartData([]);
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

  const statCards = useMemo(() => {
    const summaryData = summary ?? {};
    const coverageData = coverage ?? {};

    const totalSpend = pickNumericByKeys(summaryData, ["total_spend", "spend"]);
    const totalCo2e = pickNumericByKeys(summaryData, ["total_co2e", "co2e", "emissions"]);
    const spendRecords = pickNumericByKeys(summaryData, ["record", "entries", "count"]);
    const coveragePercent = pickNumericByKeys(coverageData, ["coverage", "percent", "ratio"]);

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
        value: totalCo2e === null ? "N/A" : `${formatCompactNumber(totalCo2e)} tCO2e`,
        trendValue: totalCo2e === null ? "N/A" : "Live",
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

  const totalRecords = Number(summary?.records_calculated || 0) + Number(summary?.records_uncalculated || 0);
  const isEmpty = !isLoading && !hasError && totalRecords === 0;
  const shouldShowSeedingState = isSeedingDemo || (isEmpty && !hasSeededRef.current);

  useEffect(() => {
    let isMounted = true;

    async function seedDemoData() {
      if (!isEmpty || hasError || hasSeededRef.current) {
        return;
      }

      hasSeededRef.current = true;
      setIsSeedingDemo(true);

      try {
        await api.post("/spend/seed-demo-data");
        await loadDashboardData();
      } catch (error: unknown) {
        toast.error("Demo setup failed", getErrorMessage(error, "Could not generate onboarding demo data."));
      } finally {
        if (isMounted) {
          setIsSeedingDemo(false);
        }
      }
    }

    void seedDemoData();

    return () => {
      isMounted = false;
    };
  }, [hasError, isEmpty, loadDashboardData, toast]);

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
            <CardDescription>Fetching spend summary and coverage metrics.</CardDescription>
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
          <Button onClick={handleRunBatchCalculation} disabled={isCalculating}>
            {isCalculating ? "Running..." : "Run Batch Calculation"}
          </Button>
        </div>
      </div>

      {hasError ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load dashboard data</CardTitle>
            <CardDescription>
              We could not fetch `/spend/summary` or `/spend/coverage` right now.
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
              <ActivityChart data={chartData} />
            </div>
            <div className="xl:col-span-1">
              <RecentActivityFeed activities={recentActivities} />
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
