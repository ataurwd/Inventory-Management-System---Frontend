"use client";

import { useAuth } from "@/hooks/useAuth";
import useSWR from "swr";
import { dashboardService } from "@/services/dashboard.service";
import PageHeader from "@/components/layout/PageHeader";
import KpiTile from "@/components/dashboard/KpiTile";
import RevenueChart from "@/components/dashboard/RevenueChart";
import AlertSummaryPanel from "@/components/dashboard/AlertSummaryPanel";
import WasteDonutChart from "@/components/dashboard/WasteDonutChart";
import { ShoppingBag, DollarSign, AlertTriangle, Hourglass, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === "admin" || user?.role === "manager";

  // Fetch KPI Stats
  const { data: stats, isLoading: loadingStats } = useSWR(
    "/dashboard/stats",
    () => dashboardService.getStats()
  );

  // Fetch Waste Risk (Managers/Admins only)
  const { data: wasteRisk } = useSWR(
    isManagerOrAdmin ? "/dashboard/waste-risk" : null,
    () => dashboardService.getWasteRisk()
  );

  // Compute category waste details
  const categoryWaste = wasteRisk
    ? Object.entries(
        wasteRisk.reduce((acc: Record<string, number>, item) => {
          acc[item.category] = (acc[item.category] || 0) + item.qty;
          return acc;
        }, {})
      ).map(([category, qty]) => ({ category, qty }))
    : [];

  const breadcrumbs = [
    { label: "App", href: "/dashboard" },
    { label: "Dashboard" }
  ];

  if (loadingStats || !stats) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
        <PageHeader title="Dashboard" breadcrumbs={breadcrumbs} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[380px] lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[380px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <PageHeader title="Dashboard" breadcrumbs={breadcrumbs} />

      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-md shadow-sm relative overflow-hidden flex items-center justify-between">
        <div className="space-y-1 z-10">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-5 w-5 text-primary" />
            Welcome back, {user?.name}!
          </h2>
          <p className="text-xs text-muted-foreground max-w-xl">
            You are logged in as <span className="text-primary font-semibold capitalize">{user?.role}</span>. Here is the operational status of your inventory today.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          label="Total Products"
          value={stats.totalProducts}
          icon={ShoppingBag}
          iconClassName="text-blue-500"
          subtext="Active catalog items"
        />
        <KpiTile
          label="Today's Revenue"
          value={stats.todayRevenue}
          icon={DollarSign}
          iconClassName="text-emerald-500"
          isCurrency
          subtext="Captured sales"
        />
        <KpiTile
          label="Low Stock Alerts"
          value={stats.totalLowStockAlerts}
          icon={AlertTriangle}
          iconClassName="text-amber-500"
          subtext={stats.totalLowStockAlerts > 0 ? "Requires reorder" : "Stock level optimal"}
          subtextType={stats.totalLowStockAlerts > 0 ? "warning" : "success"}
        />
        <KpiTile
          label="Expiry Alerts"
          value={stats.totalExpiryAlerts}
          icon={Hourglass}
          iconClassName="text-destructive"
          subtext={stats.totalExpiryAlerts > 0 ? "Expiring within 15 days" : "No critical expiry"}
          subtextType={stats.totalExpiryAlerts > 0 ? "critical" : "success"}
        />
      </div>

      {/* Charts & Panels Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Area Chart */}
        <RevenueChart
          className="lg:col-span-2 shadow-sm"
          data={stats.weeklyRevenue}
        />

        {/* Alerts Summary Panel */}
        <AlertSummaryPanel />

        {/* Waste Risk Donut Chart (Shown only to authorized roles) */}
        {isManagerOrAdmin && categoryWaste.length > 0 && (
          <WasteDonutChart
            className="lg:col-span-3 shadow-sm"
            data={categoryWaste}
          />
        )}
      </div>
    </div>
  );
}
