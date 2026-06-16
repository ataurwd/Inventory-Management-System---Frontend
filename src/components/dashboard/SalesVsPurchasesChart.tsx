import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRightLeft } from "lucide-react";

interface SalesVsPurchasesChartProps {
  data: { date: string; sales: number; purchases: number }[];
  className?: string;
}

export default function SalesVsPurchasesChart({ data, className }: SalesVsPurchasesChartProps) {
  // Format dates for X-axis (e.g., 'Mon', 'Tue')
  const formattedData = data.map((d) => {
    const dateObj = new Date(d.date);
    return {
      ...d,
      day: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });

  return (
    <Card className={`clay border-none ${className}`}>
      <CardHeader className="py-4 px-5 border-b border-border/40">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ArrowRightLeft className="h-4.5 w-4.5 text-primary" />
          Sales vs. Restock (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
              <XAxis dataKey="day" stroke="currentColor" className="text-[10px] opacity-50" tickLine={false} axisLine={false} />
              <YAxis
                stroke="currentColor"
                className="text-[10px] opacity-50"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, ""]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="sales" name="Sales (Revenue)" fill="url(#colorSales)" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="purchases" name="Restock (Expenses)" fill="url(#colorPurchases)" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
