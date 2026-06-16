"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
  className?: string;
}

export default function RevenueChart({ data, className }: RevenueChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: format(parseISO(item.date), "MMM dd"),
  }));

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <Card className={`clay border-none ${className}`}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Weekly Revenue</CardTitle>
        <CardDescription>
          Daily sales trends for the last 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full text-xs">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No sales data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="formattedDate"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  stroke="var(--color-text-muted)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  tickFormatter={formatCurrency}
                  stroke="var(--color-text-muted)"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as any;
                      return (
                        <div className="rounded-lg border bg-popover p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-muted-foreground">{item.formattedDate}</p>
                          <p className="font-bold text-foreground">
                            Revenue: ${item.revenue.toFixed(2)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
