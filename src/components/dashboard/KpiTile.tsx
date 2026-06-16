"use client";

import { Card } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiTileProps {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClassName?: string;
  isCurrency?: boolean;
  subtext?: string;
  subtextType?: "default" | "warning" | "success" | "critical";
}

export default function KpiTile({
  label,
  value,
  icon: Icon,
  iconClassName,
  isCurrency = false,
  subtext,
  subtextType = "default",
}: KpiTileProps) {
  return (
    <Card className="p-6 relative overflow-hidden clay border-none">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            {label}
          </span>
          <div className="flex items-baseline font-heading text-2xl font-bold">
            {isCurrency && <span className="mr-0.5">$</span>}
            <NumberTicker
              value={value}
              decimalPlaces={isCurrency ? 2 : 0}
              className="text-foreground"
            />
          </div>
        </div>
        <div className={cn("p-2.5 rounded-xl border bg-muted/40", iconClassName)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      {subtext && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "font-medium",
              subtextType === "success" && "text-emerald-500",
              subtextType === "warning" && "text-amber-500",
              subtextType === "critical" && "text-destructive",
              subtextType === "default" && "text-muted-foreground"
            )}
          >
            {subtext}
          </span>
        </div>
      )}
    </Card>
  );
}
