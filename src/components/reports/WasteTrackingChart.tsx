"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

interface WasteTrackingChartProps {
  data: { date: string; qty: number; loss: number }[];
  groupBy: 'day' | 'week';
  className?: string;
}

export default function WasteTrackingChart({ data, groupBy, className }: WasteTrackingChartProps) {
  const formattedData = data.map((item) => {
    let formattedDate = item.date;
    try {
      if (groupBy === 'day') {
        formattedDate = format(parseISO(item.date), "MMM dd");
      } else {
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

  const formatQuantity = (value: number) => {
    return value.toString();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Inventory Waste Tracking</CardTitle>
        <CardDescription>
          Tracking items discarded (expired/damaged) and the resulting financial loss.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full text-xs">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No waste records available for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formattedData}
                margin={{ top: 10, right: -10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="formattedDate"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  stroke="var(--color-muted-foreground)"
                />
                {/* Left Y Axis for Quantity */}
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  tickFormatter={formatQuantity}
                  stroke="#ef4444" // red-500
                />
                {/* Right Y Axis for Financial Loss */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  dx={10}
                  tickFormatter={formatCurrency}
                  stroke="#f97316" // orange-500
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
                            <span className="text-red-400">Qty Wasted:</span>
                            <span className="font-bold text-red-500">{item.qty} units</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-orange-400">Financial Loss:</span>
                            <span className="font-bold text-orange-500">${item.loss.toFixed(2)}</span>
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
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="qty"
                  name="Wasted Quantity"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4, stroke: "#ef4444", strokeWidth: 1, fill: "var(--color-card)" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="loss"
                  name="Financial Loss"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 4, stroke: "#f97316", strokeWidth: 1, fill: "var(--color-card)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
