"use client";

import { useMemo, useState } from "react";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

type ApiErrorResponse = {
  detail?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail || fallback;
  }

  return fallback;
}

export default function SettingsPage() {
  const toast = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const adminToolsEnabled = useMemo(
    () => process.env.NEXT_PUBLIC_ENABLE_ADMIN_TOOLS === "true",
    [],
  );

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

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-scope-text">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-scope-textMuted">
          Manage user preferences, workspace defaults, and integrations.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Preferences</CardTitle>
            <CardDescription>Notification, profile, and personal defaults.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-24 rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-scope-border dark:bg-scope-bg/35" />
            <Button variant="secondary">Update Profile Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace Configuration</CardTitle>
            <CardDescription>Teams, access roles, and reporting parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-24 rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-scope-border dark:bg-scope-bg/35" />
            <Button variant="outline">Open Workspace Controls</Button>
          </CardContent>
        </Card>
      </div>

      {adminToolsEnabled ? (
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
    </section>
  );
}
