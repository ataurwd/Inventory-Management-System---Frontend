"use client";

import { useAuth } from "@/hooks/useAuth";
import useSWR from "swr";
import { dashboardService } from "@/services/dashboard.service";
import PageHeader from "@/components/layout/PageHeader";
import KpiTile from "@/components/dashboard/KpiTile";
import RevenueChart from "@/components/dashboard/RevenueChart";
import AlertSummaryPanel from "@/components/dashboard/AlertSummaryPanel";
import WasteDonutChart from "@/components/dashboard/WasteDonutChart";
import SalesVsPurchasesChart from "@/components/dashboard/SalesVsPurchasesChart";
import TopSellingProducts from "@/components/dashboard/TopSellingProducts";
import RecentTransactionsTable from "@/components/dashboard/RecentTransactionsTable";
import { ShoppingBag, DollarSign, AlertTriangle, Hourglass, Sparkles, Wallet, TrendingUp } from "lucide-react";
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
      <div className="p-8 w-full max-w-none mx-auto space-y-8 animate-fade-in">
        <PageHeader title="Dashboard" breadcrumbs={breadcrumbs} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[380px] lg:col-span-2 rounded-xl animate-pulse" />
          <Skeleton className="h-[380px] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-none mx-auto space-y-8 animate-fade-in">
      <PageHeader title="Dashboard" breadcrumbs={breadcrumbs} />

      {/* Welcome Banner */}
      <div className="p-6 clay relative overflow-hidden flex items-center justify-between">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiTile
          label="Total Products"
          value={stats.totalProducts}
          icon={ShoppingBag}
          iconClassName="text-blue-500"
          subtext="Active catalog items"
        />
        {isManagerOrAdmin && (
          <>
            <KpiTile
              label="Inventory Valuation"
              value={stats.inventoryValuation}
              icon={Wallet}
              iconClassName="text-indigo-500"
              isCurrency
              subtext="Total asset value"
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
              label="7-Day Profit/Loss"
              value={stats.profitOrLoss}
              icon={TrendingUp}
              iconClassName={stats.profitOrLoss >= 0 ? "text-emerald-500" : "text-destructive"}
              isCurrency
              subtext="Revenue vs Restock Expenses"
            />
          </>
        )}
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
      {isManagerOrAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Row 1 */}
          <SalesVsPurchasesChart className="lg:col-span-2" data={stats.salesVsPurchases} />
          <TopSellingProducts className="" products={stats.topSellingProducts} />

          {/* Row 2 */}
          <RevenueChart
            className="lg:col-span-2"
            data={stats.weeklyRevenue}
          />
          <AlertSummaryPanel />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TopSellingProducts products={stats.topSellingProducts} hideRevenue />
          <AlertSummaryPanel />
        </div>
      )}
    </div>
  );
}
