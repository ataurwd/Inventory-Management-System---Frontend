"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

interface ProfitChartProps {
  data: { date: string; revenue: number; cost: number; profit: number }[];
  groupBy: 'day' | 'week';
  className?: string;
}

export default function ProfitChart({ data, groupBy, className }: ProfitChartProps) {
  const formattedData = data.map((item) => {
    let formattedDate = item.date;
    try {
      if (groupBy === 'day') {
        formattedDate = format(parseISO(item.date), "MMM dd");
      } else {
        // week format e.g. "2026-W24" -> "W24" or keep it as is
        const parts = item.date.split("-");
        if (parts.length === 2 && parts[1].startsWith("W")) {
          formattedDate = parts[1]; // e.g. "W24"
        }
      }
    } catch {
      // fallback
    }

    return {
      ...item,
      formattedDate,
    };
  });

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Revenue vs. Cost & Profit</CardTitle>
        <CardDescription>
          Comparison of sales revenue, product cost, and net margins.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full text-xs">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No financial data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="formattedDate"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  tickFormatter={formatCurrency}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as any;
                      return (
                        <div className="rounded-xl border border-border bg-card/90 backdrop-blur-md p-3 shadow-lg text-xs space-y-1.5 min-w-[140px]">
                          <p className="font-semibold text-muted-foreground border-b border-border pb-1 mb-1">
                            {groupBy === 'day' ? format(parseISO(item.date), "MMMM dd, YYYY") : item.date}
                          </p>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Revenue:</span>
                            <span className="font-bold text-[oklch(0.65_0.22_280)]">${item.revenue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Cost:</span>
                            <span className="font-bold text-amber-500">${item.cost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Net Profit:</span>
                            <span className="font-bold text-[oklch(0.70_0.18_160)]">${item.profit.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle" 
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: '10px' }}
                />
                <Bar
                  name="Revenue"
                  dataKey="revenue"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={35}
                />
                <Bar
                  name="Cost"
                  dataKey="cost"
                  fill="#f59e0b" // amber-500
                  radius={[4, 4, 0, 0]}
                  maxBarSize={35}
                />
                <Bar
                  name="Net Profit"
                  dataKey="profit"
                  fill="oklch(0.70 0.18 160)" // success oklch green
                  radius={[4, 4, 0, 0]}
                  maxBarSize={35}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
