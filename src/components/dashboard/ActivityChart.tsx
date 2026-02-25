"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

type ActivityPoint = {
  month: string;
  activity: number;
};

type ActivityChartProps = {
  data: ActivityPoint[];
};

export default function ActivityChart({ data }: ActivityChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Activity Trend</CardTitle>
        <CardDescription>
          Monthly approved actions across suppliers and scopes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#263756" />
              <XAxis dataKey="month" stroke="#9ab0d1" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ab0d1" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0e1629",
                  border: "1px solid #263756",
                  borderRadius: "10px",
                  color: "#e6edf7",
                }}
                labelStyle={{ color: "#9ab0d1" }}
              />
              <Line
                type="monotone"
                dataKey="activity"
                stroke="#4f7cff"
                strokeWidth={2.5}
                dot={{ fill: "#4f7cff", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
