import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export default function AnalyticsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-scope-text">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-scope-textMuted">
          Measure trends, benchmark progress, and generate reporting insights.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Emissions Trend</CardTitle>
            <CardDescription>Monthly Scope 1-3 change over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52 rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-scope-border dark:bg-scope-bg/35" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Performance</CardTitle>
            <CardDescription>Rank suppliers by emissions intensity and variance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52 rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-scope-border dark:bg-scope-bg/35" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
