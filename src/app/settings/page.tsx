import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export default function SettingsPage() {
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
    </section>
  );
}
