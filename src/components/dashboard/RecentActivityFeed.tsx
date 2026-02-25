import { Clock3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

type ActivityItem = {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
};

type RecentActivityFeedProps = {
  activities: ActivityItem[];
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest actions from workspace collaborators.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-scope-border dark:bg-scope-bg/30"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-800 dark:bg-scope-surfaceMuted dark:text-scope-text">
              {initials(activity.user)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-800 dark:text-scope-text">
                <span className="font-semibold">{activity.user}</span> {activity.action}{" "}
                <span className="font-medium text-scope-primary">{activity.target}</span>
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-scope-textMuted">
                <Clock3 className="h-3 w-3" />
                {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
