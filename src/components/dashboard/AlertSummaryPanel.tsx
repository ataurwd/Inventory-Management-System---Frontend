"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { inventoryService } from "@/services/inventory.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Hourglass, ArrowRight, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AlertItem {
  id: string;
  productId: string;
  name: string;
  type: "low-stock" | "expiry";
  details: string;
  severity: "critical" | "warning";
}

export default function AlertSummaryPanel() {
  const router = useRouter();

  const { data: lowStock, isLoading: loadingLow } = useSWR("/inventory/low-stock", () =>
    inventoryService.getLowStock()
  );

  const { data: expiryAlerts, isLoading: loadingExp } = useSWR("/inventory/expiry-alerts", () =>
    inventoryService.getExpiryAlerts()
  );

  const isLoading = loadingLow || loadingExp;

  const alerts: AlertItem[] = [];

  if (lowStock) {
    lowStock.forEach((item: any) => {
      alerts.push({
        id: `low-${item._id}`,
        productId: item._id,
        name: item.name,
        type: "low-stock",
        details: `Stock: ${item.totalStock} ${item.unit} (Safety: ${item.safetyStockLevel})`,
        severity: item.totalStock === 0 ? "critical" : "warning",
      });
    });
  }

  if (expiryAlerts) {
    expiryAlerts.forEach((item: any) => {
      alerts.push({
        id: `exp-${item.productId}-${item.batchNo}`,
        productId: item.productId,
        name: item.productName,
        type: "expiry",
        details: `Batch ${item.batchNo} expires in ${item.daysRemaining} days`,
        severity: item.daysRemaining <= 7 ? "critical" : "warning",
      });
    });
  }

  const topAlerts = alerts.slice(0, 5);

  return (
    <Card className="flex flex-col h-full border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">System Alerts</CardTitle>
        <CardDescription>
          Critical low stock levels and expiring batches.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : topAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2 border border-dashed rounded-xl">
            <CheckCircle className="h-8 w-8 text-emerald-500 opacity-80 animate-bounce" />
            <p className="text-xs font-semibold text-foreground">All systems clear</p>
            <p className="text-[10px]">No low stock or expiry concerns at present.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => router.push(`/inventory/${alert.productId}`)}
                className="group flex items-center justify-between p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    alert.severity === "critical"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-amber-500/10 text-amber-500"
                  }`}>
                    {alert.type === "low-stock" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Hourglass className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {alert.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {alert.details}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={alert.severity === "critical" ? "critical" : "warning"}>
                    {alert.type === "low-stock" ? "Low Stock" : "Expiry Risk"}
                  </Badge>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
