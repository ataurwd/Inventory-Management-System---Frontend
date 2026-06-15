"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { format, subDays, parseISO } from "date-fns";
import { reportsService } from "@/services/reports.service";
import PageHeader from "@/components/layout/PageHeader";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ProfitChart from "@/components/reports/ProfitChart";
import WasteTrackingChart from "@/components/reports/WasteTrackingChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, DollarSign, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();

  // Date range state: default to last 30 days
  const [from, setFrom] = useState<string>(
    format(subDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [to, setTo] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [groupBy, setGroupBy] = useState<"day" | "week">("day");

  // Fetch report data
  const { data, error, isLoading, mutate } = useSWR(
    [`/transactions/report`, from, to, groupBy],
    () => reportsService.getReport({ from, to, groupBy })
  );

  // Compute summary stats from report data
  const totalRevenue = data?.revenue.reduce((sum, item) => sum + item.revenue, 0) || 0;
  const totalCost = data?.revenue.reduce((sum, item) => sum + item.cost, 0) || 0;
  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const totalWasteQty = data?.waste.reduce((sum, item) => sum + item.qty, 0) || 0;
  const totalWasteLoss = data?.waste.reduce((sum, item) => sum + item.loss, 0) || 0;

  const breadcrumbs = [
    { label: "App", href: "/dashboard" },
    { label: "Reports" }
  ];

  const handleRefresh = () => {
    mutate();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        breadcrumbs={breadcrumbs}
        action={{
          label: "Expiry Calendar",
          onClick: () => router.push("/reports/expiry-calendar"),
        }}
      />

      {/* Control Panel: Filters */}
      <div className="p-5 rounded-2xl border border-border bg-card/40 backdrop-blur-md shadow-xs flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Start Date
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3.5 py-1.5 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-foreground w-40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> End Date
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3.5 py-1.5 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-foreground w-40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Grouping</label>
            <div className="flex rounded-lg bg-background border border-border p-1">
              <button
                onClick={() => setGroupBy("day")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  groupBy === "day"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setGroupBy("week")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  groupBy === "week"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Weekly
              </button>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 h-9"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary KPI Tiles */}
      {isLoading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Tile */}
          <Card className="shadow-xs bg-card/25 backdrop-blur-md border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Period Revenue</p>
                <h3 className="text-2xl font-bold text-[oklch(0.65_0.22_280)]">
                  ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Cost Tile */}
          <Card className="shadow-xs bg-card/25 backdrop-blur-md border-border hover:border-amber-500/30 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Period Cost</p>
                <h3 className="text-2xl font-bold text-amber-500">
                  ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <BarChart3 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Net Profit Tile */}
          <Card className="shadow-xs bg-card/25 backdrop-blur-md border-border hover:border-emerald-500/30 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Net Profit</p>
                <h3 className="text-2xl font-bold text-[oklch(0.70_0.18_160)]">
                  ${netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Margin: <span className="font-semibold text-[oklch(0.70_0.18_160)]">{profitMargin.toFixed(1)}%</span>
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[oklch(0.70_0.18_160)]/10 border border-[oklch(0.70_0.18_160)]/20 flex items-center justify-center text-[oklch(0.70_0.18_160)]">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Waste Loss Tile */}
          <Card className="shadow-xs bg-card/25 backdrop-blur-md border-border hover:border-red-500/30 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Stock Waste Loss</p>
                <h3 className="text-2xl font-bold text-red-500">
                  ${totalWasteLoss.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Discarded: <span className="font-semibold text-red-400">{totalWasteQty} units</span>
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart Section */}
      {isLoading && !data ? (
        <div className="space-y-6">
          <Skeleton className="h-96 w-full rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] w-full rounded-2xl animate-pulse" />
            <Skeleton className="h-[400px] w-full rounded-2xl animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Revenue Area Chart */}
          <RevenueChart
            className="shadow-sm border border-border/80 bg-card/15 backdrop-blur-md rounded-2xl"
            data={data?.revenue || []}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Margin Chart */}
            <ProfitChart
              data={data?.revenue || []}
              groupBy={groupBy}
              className="shadow-sm border border-border/80 bg-card/15 backdrop-blur-md rounded-2xl"
            />

            {/* Waste Tracking Chart */}
            <WasteTrackingChart
              data={data?.waste || []}
              groupBy={groupBy}
              className="shadow-sm border border-border/80 bg-card/15 backdrop-blur-md rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
