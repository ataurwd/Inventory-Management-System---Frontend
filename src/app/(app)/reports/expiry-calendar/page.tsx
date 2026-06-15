"use client";

import useSWR from "swr";
import { format, parseISO } from "date-fns";
import { reportsService } from "@/services/reports.service";
import PageHeader from "@/components/layout/PageHeader";
import ExpiryCalendar from "@/components/reports/ExpiryCalendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Hourglass, ShieldAlert, ShieldAlert as SafeIcon } from "lucide-react";

export default function ExpiryCalendarPage() {
  // Fetch expiry alerts for the next 60 days
  const { data: alerts, error, isLoading } = useSWR(
    "/inventory/expiry-alerts?days=60",
    () => reportsService.getExpiryAlerts(60)
  );

  const breadcrumbs = [
    { label: "App", href: "/dashboard" },
    { label: "Reports", href: "/reports" },
    { label: "Expiry Calendar" }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <PageHeader title="Expiry Calendar" breadcrumbs={breadcrumbs} />

      {/* Main Grid: Calendar & Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Calendar (2/3 width) */}
        <div className="lg:col-span-2">
          {isLoading || !alerts ? (
            <Skeleton className="h-[420px] w-full rounded-2xl animate-pulse" />
          ) : (
            <ExpiryCalendar alerts={alerts} />
          )}
        </div>

        {/* Right Side: Legend & Instructions */}
        <div className="rounded-2xl border border-border bg-card/45 backdrop-blur-md p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
              <Hourglass className="h-4 w-4 text-primary" />
              Calendar Legend
            </h3>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Stock batches are evaluated by their remaining days until expiry. View the threshold severities below:
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                <span className="h-3.5 w-3.5 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_8px_#ef4444]" />
                <div>
                  <p className="font-semibold text-red-400">Critical Expiry</p>
                  <p className="text-[10px] text-muted-foreground">Expires in 7 days or less</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <span className="h-3.5 w-3.5 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_8px_#f59e0b]" />
                <div>
                  <p className="font-semibold text-amber-400">Warning Expiry</p>
                  <p className="text-[10px] text-muted-foreground">Expires in 8 to 30 days</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_8px_#10b981]" />
                <div>
                  <p className="font-semibold text-emerald-400">Safe Expiry</p>
                  <p className="text-[10px] text-muted-foreground">Expires in 31 to 60 days</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-[11px] text-muted-foreground leading-relaxed">
            💡 <strong>Action Tip:</strong> Near-expiry stock (critical and warning) should be placed on promotional clearance discounts on the Waste Alerts screen.
          </div>
        </div>
      </div>

      {/* Expiry Details Table (List View) */}
      <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-md p-6 shadow-sm">
        <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Expiry List (Next 60 Days)
        </h3>

        {isLoading || !alerts ? (
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full animate-pulse" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs">
            No stock batches are scheduled to expire in the next 60 days. All stock is safe!
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <Table>
              <TableHeader className="bg-sidebar/30">
                <TableRow>
                  <TableHead className="font-bold">Product Name</TableHead>
                  <TableHead className="font-bold">Barcode</TableHead>
                  <TableHead className="font-bold">Batch No</TableHead>
                  <TableHead className="font-bold text-right">Quantity</TableHead>
                  <TableHead className="font-bold">Expiry Date</TableHead>
                  <TableHead className="font-bold">Days Left</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert, idx) => {
                  const badgeVariant =
                    alert.daysRemaining <= 7
                      ? "critical"
                      : alert.daysRemaining <= 30
                      ? "warning"
                      : "safe";

                  const badgeText =
                    alert.daysRemaining <= 7
                      ? "Critical"
                      : alert.daysRemaining <= 30
                      ? "Warning"
                      : "Safe";

                  return (
                    <TableRow key={idx} className="hover:bg-sidebar-accent/15 transition-colors">
                      <TableCell className="font-semibold text-foreground">{alert.productName}</TableCell>
                      <TableCell className="font-mono text-xs">{alert.barcode}</TableCell>
                      <TableCell className="font-mono text-xs">{alert.batchNo}</TableCell>
                      <TableCell className="text-right font-medium">{alert.qty}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(parseISO(alert.expiryDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {alert.daysRemaining <= 0 ? (
                          <span className="text-red-500 font-bold">Expired</span>
                        ) : (
                          `${alert.daysRemaining} days`
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badgeVariant} className="rounded-md font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5">
                          {badgeText}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
