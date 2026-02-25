import { CheckCircle2, ClipboardList, PauseCircle, ShieldAlert } from "lucide-react";
import { ActivityChart, RecentActivityFeed, StatCard } from "@/components/dashboard";

const statCards = [
  {
    title: "Active Scopes",
    value: "18",
    trendValue: "+12.4%",
    trendDirection: "up" as const,
    description: "Compared to last month",
    icon: ClipboardList,
  },
  {
    title: "Pending Approvals",
    value: "7",
    trendValue: "-8.1%",
    trendDirection: "down" as const,
    description: "Approval backlog trend",
    icon: PauseCircle,
  },
  {
    title: "Compliance Coverage",
    value: "94%",
    trendValue: "+3.6%",
    trendDirection: "up" as const,
    description: "Verified controls in place",
    icon: CheckCircle2,
  },
  {
    title: "Open Risk Flags",
    value: "5",
    trendValue: "-15.0%",
    trendDirection: "down" as const,
    description: "Critical alerts requiring action",
    icon: ShieldAlert,
  },
];

const activityTrendData = [
  { month: "Jan", activity: 62 },
  { month: "Feb", activity: 74 },
  { month: "Mar", activity: 71 },
  { month: "Apr", activity: 88 },
  { month: "May", activity: 94 },
  { month: "Jun", activity: 108 },
  { month: "Jul", activity: 103 },
  { month: "Aug", activity: 117 },
];

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

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ActivityChart data={activityTrendData} />
        </div>
        <div className="xl:col-span-1">
          <RecentActivityFeed activities={recentActivities} />
        </div>
      </div>
    </section>
  );
}
