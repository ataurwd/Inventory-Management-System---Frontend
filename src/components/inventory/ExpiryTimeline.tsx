"use client";

import { Batch } from "@/types/product.types";

function daysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getBarColor(days: number): string {
  if (days < 0) return "bg-gray-400";
  if (days <= 7) return "bg-red-500";
  if (days <= 30) return "bg-amber-500";
  return "bg-emerald-500";
}

function getTextColor(days: number): string {
  if (days < 0) return "text-gray-400";
  if (days <= 7) return "text-red-400";
  if (days <= 30) return "text-amber-400";
  return "text-emerald-400";
}

interface ExpiryTimelineProps {
  batches: Batch[];
}

export default function ExpiryTimeline({ batches }: ExpiryTimelineProps) {
  if (batches.length === 0) return null;

  // Sort by expiry ascending
  const sorted = [...batches].sort(
    (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
  );

  // Calculate max days for proportional bar widths (cap at 180 for visual balance)
  const maxDays = Math.max(
    ...sorted.map((b) => Math.max(daysUntilExpiry(b.expiry_date), 0)),
    1
  );
  const scaleDays = Math.min(maxDays, 180);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Expiry Timeline
      </h3>

      <div className="space-y-2">
        {sorted.map((batch) => {
          const days = daysUntilExpiry(batch.expiry_date);
          const clampedDays = Math.max(Math.min(days, scaleDays), 0);
          const widthPercent = scaleDays > 0 ? Math.max((clampedDays / scaleDays) * 100, 4) : 4;

          return (
            <div
              key={batch.batch_no}
              className="flex items-center gap-3 group"
            >
              {/* Batch label */}
              <div className="w-28 shrink-0 text-right">
                <span className="text-xs font-mono font-medium text-foreground">
                  {batch.batch_no}
                </span>
                <span className="text-xs text-muted-foreground ml-1.5">
                  ({batch.qty})
                </span>
              </div>

              {/* Bar */}
              <div className="flex-1 h-6 bg-muted/40 rounded-lg overflow-hidden relative">
                <div
                  className={`h-full rounded-lg transition-all duration-500 ease-out ${getBarColor(days)} opacity-80 group-hover:opacity-100`}
                  style={{
                    width: days < 0 ? "100%" : `${widthPercent}%`,
                  }}
                />
              </div>

              {/* Days label */}
              <div className={`w-20 text-right text-xs font-semibold ${getTextColor(days)}`}>
                {days < 0 ? "Expired" : days === 0 ? "Today" : `${days} days`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          &le; 7 days
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          &le; 30 days
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          &gt; 30 days
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
          Expired
        </div>
      </div>
    </div>
  );
}
