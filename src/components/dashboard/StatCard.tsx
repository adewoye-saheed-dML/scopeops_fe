import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { cn } from "@/lib/utils";

type TrendDirection = "up" | "down";

type StatCardProps = {
  title: string;
  value: string;
  trendValue: string;
  trendDirection: TrendDirection;
  description: string;
  icon: LucideIcon;
};

export default function StatCard({
  title,
  value,
  trendValue,
  trendDirection,
  description,
  icon: Icon,
}: StatCardProps) {
  const isUp = trendDirection === "up";
  const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardDescription>{title}</CardDescription>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-scope-surfaceMuted dark:text-scope-textMuted">
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
            isUp
              ? "bg-success/15 text-success"
              : "bg-error/15 text-error",
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {trendValue}
        </div>
        <p className="text-xs text-slate-500 dark:text-scope-textMuted">{description}</p>
      </CardContent>
    </Card>
  );
}
