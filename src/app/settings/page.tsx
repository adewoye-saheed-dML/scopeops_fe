"use client";

import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { Shield, SlidersHorizontal, UserCircle2, type LucideIcon } from "lucide-react";
import api from "@/lib/api";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { useToast } from "@/hooks/useToast";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";

type ApiErrorResponse = {
  detail?: string;
};

type SettingsTab = "profile" | "emission_factors" | "admin_tools";
type MappingRow = {
  id: string;
  erp_category: string;
  matched_factor: string;
  confidence_score: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail || fallback;
  }

  return fallback;
}

export default function SettingsPage() {
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const [isSeeding, setIsSeeding] = useState(false);
  const isAdmin = user?.is_admin === true;
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const tabs = useMemo(
    () =>
      [
        { key: "profile" as const, label: "Profile", icon: UserCircle2 },
        { key: "emission_factors" as const, label: "Emission Factors", icon: SlidersHorizontal },
        ...(isAdmin ? [{ key: "admin_tools" as const, label: "Admin Tools", icon: Shield }] : []),
      ] satisfies Array<{ key: SettingsTab; label: string; icon: LucideIcon }>,
    [isAdmin],
  );

  useEffect(() => {
    if (!isAdmin && activeTab === "admin_tools") {
      setActiveTab("profile");
    }
  }, [activeTab, isAdmin]);

  async function handleSeedDatabase() {
    setIsSeeding(true);
    try {
      await api.post("/admin/seed-database");
      toast.success("Seed triggered", "Database seed request was sent successfully.");
    } catch (error: unknown) {
      toast.error("Seed failed", getErrorMessage(error, "Could not trigger database seed."));
    } finally {
      setIsSeeding(false);
    }
  }

  const mappingRows: MappingRow[] = useMemo(
    () => [
      {
        id: "1",
        erp_category: "IT_HARDWARE",
        matched_factor: "EPA - Computers & Electronics",
        confidence_score: "98%",
      },
      {
        id: "2",
        erp_category: "CLOUD_SERVICES",
        matched_factor: "DEFRA - Data Processing Services",
        confidence_score: "95%",
      },
      {
        id: "3",
        erp_category: "LOGISTICS_FREIGHT",
        matched_factor: "EPA - Freight Transportation",
        confidence_score: "97%",
      },
    ],
    [],
  );

  const mappingColumns = useMemo<DataTableColumn<MappingRow>[]>(
    () => [
      { key: "erp_category", header: "ERP Category", sortable: true },
      { key: "matched_factor", header: "Matched Factor", sortable: true },
      { key: "confidence_score", header: "Confidence Score", sortable: true },
    ],
    [],
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-scope-text">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-scope-textMuted">
          Manage user preferences, workspace defaults, and integrations.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Sections</CardTitle>
            <CardDescription>Configure your account and carbon engine settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-scope-primary/15 font-medium text-scope-primary"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-scope-textMuted dark:hover:bg-scope-surfaceMuted dark:hover:text-scope-text"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </CardContent>
        </Card>

        {activeTab === "profile" ? (
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your authenticated account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-scope-border dark:bg-scope-bg/35">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-scope-textMuted">Name</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-scope-text">
                    {user?.full_name || "N/A"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-scope-border dark:bg-scope-bg/35">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-scope-textMuted">Email</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-scope-text">
                    {user?.email || "N/A"}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-scope-border dark:bg-scope-bg/35">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-scope-textMuted">Provider</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-scope-text">
                  {user?.provider?.toLowerCase() === "google" ? "Google" : user?.provider || "Local"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {activeTab === "emission_factors" ? (
          <Card>
            <CardHeader>
              <CardTitle>Category Mapping</CardTitle>
              <CardDescription>
                Map internal ERP categories to matched emission factors in the engine.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={mappingColumns}
                rows={mappingRows}
                rowKey={(row) => row.id}
                pageSize={6}
                emptyMessage="No mappings configured yet."
              />
            </CardContent>
          </Card>
        ) : null}

        {activeTab === "admin_tools" && isAdmin ? (
          <Card className="border-warning/30">
            <CardHeader>
              <CardTitle>Admin Tools</CardTitle>
              <CardDescription>
                Restricted setup controls for environment bootstrapping.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-500 dark:text-scope-textMuted">
                Use this only once on initial deployment.
              </p>
              <Button variant="outline" onClick={handleSeedDatabase} disabled={isSeeding}>
                {isSeeding ? "Seeding..." : "Seed Database"}
              </Button>
            </CardContent>
          </Card>
        ) : null}

      </div>
    </section>
  );
}
