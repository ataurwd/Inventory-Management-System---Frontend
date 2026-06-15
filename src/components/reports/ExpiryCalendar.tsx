"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  parseISO,
} from "date-fns";
import { ExpiryAlertItem } from "@/services/reports.service";
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExpiryCalendarProps {
  alerts: ExpiryAlertItem[];
}

export default function ExpiryCalendar({ alerts }: ExpiryCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Navigation handlers
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Calendar math
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

  // Get index of the first day (0 = Sunday, 6 = Saturday) to pad the grid
  const startDayIndex = getDay(firstDayOfMonth);
  const paddingDays = Array.from({ length: startDayIndex });

  // Match alerts to a specific day
  const getDayAlerts = (date: Date) => {
    return alerts.filter((alert) => {
      const alertDate = parseISO(alert.expiryDate);
      return isSameDay(alertDate, date);
    });
  };

  // Determine dot color based on severity
  const getStatusColor = (dayAlerts: ExpiryAlertItem[]) => {
    if (dayAlerts.length === 0) return null;

    const hasCritical = dayAlerts.some((a) => a.daysRemaining <= 7);
    if (hasCritical) return "bg-red-500 shadow-[0_0_8px_#ef4444]";

    const hasWarning = dayAlerts.some((a) => a.daysRemaining <= 30);
    if (hasWarning) return "bg-amber-500 shadow-[0_0_8px_#f59e0b]";

    return "bg-emerald-500 shadow-[0_0_8px_#10b981]";
  };

  const handleDayClick = (date: Date, dayAlerts: ExpiryAlertItem[]) => {
    if (dayAlerts.length > 0) {
      setSelectedDate(date);
      setIsDialogOpen(true);
    }
  };

  const selectedDayAlerts = selectedDate ? getDayAlerts(selectedDate) : [];

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-md p-6 shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <p className="text-xs text-muted-foreground">
            Select highlighted dates to view expiring batch details.
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handlePrevMonth}
            className="hover:bg-sidebar-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
            className="text-xs px-2.5 h-8"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleNextMonth}
            className="hover:bg-sidebar-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekdays Grid Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-muted-foreground text-xs pb-3 border-b border-border">
        {weekdays.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 mt-3">
        {/* Padding Empty Cells */}
        {paddingDays.map((_, idx) => (
          <div key={`pad-${idx}`} className="aspect-square opacity-0 pointer-events-none" />
        ))}

        {/* Month Day Cells */}
        {daysInMonth.map((day, idx) => {
          const dayAlerts = getDayAlerts(day);
          const dotColor = getStatusColor(dayAlerts);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={idx}
              onClick={() => handleDayClick(day, dayAlerts)}
              disabled={dayAlerts.length === 0}
              className={`aspect-square flex flex-col items-center justify-center relative rounded-lg border transition-all ${
                dayAlerts.length > 0
                  ? "bg-card hover:bg-sidebar-accent/50 border-border/70 cursor-pointer shadow-xs active:scale-95"
                  : "bg-transparent border-transparent text-muted-foreground/60 select-none"
              }`}
            >
              {/* Day Number */}
              <span
                className={`text-sm font-medium ${
                  isToday
                    ? "h-6 w-6 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center"
                    : "text-foreground"
                }`}
              >
                {format(day, "d")}
              </span>

              {/* Expiry Dot Indicator */}
              {dotColor && (
                <span className={`h-1.5 w-1.5 rounded-full absolute bottom-2 ${dotColor}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Alerts Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2 pb-1.5 border-b border-border">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Expiries for {selectedDate ? format(selectedDate, "MMMM dd, yyyy") : ""}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Below are the batches scheduled to expire on this date.
            </DialogDescription>
          </DialogHeader>

          {/* List of Expiring Batches */}
          <div className="max-h-[300px] overflow-y-auto space-y-3 py-2 pr-1">
            {selectedDayAlerts.map((alert, idx) => {
              const severityColor =
                alert.daysRemaining <= 7
                  ? "text-red-500 border-red-500/20 bg-red-500/10"
                  : alert.daysRemaining <= 30
                  ? "text-amber-500 border-amber-500/20 bg-amber-500/10"
                  : "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-border bg-sidebar/25 flex flex-col gap-2 hover:border-border/80 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{alert.productName}</h4>
                      <p className="text-[11px] text-muted-foreground">Barcode: {alert.barcode}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${severityColor}`}>
                      {alert.daysRemaining <= 0
                        ? "Expired"
                        : `${alert.daysRemaining} days left`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-border/40 pt-2 text-muted-foreground">
                    <div>
                      Batch: <span className="font-medium text-foreground">{alert.batchNo}</span>
                    </div>
                    <div>
                      Qty at risk: <span className="font-semibold text-foreground">{alert.qty} units</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
              className="text-xs cursor-pointer border-border hover:bg-sidebar-accent"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
