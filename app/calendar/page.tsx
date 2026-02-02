"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
} from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Demo data - random status for each day
const generateDemoData = (year: number, month: number) => {
  const data: Record<string, "updated" | "missed" | "pending"> = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];

    if (date > today) {
      data[dateStr] = "pending";
    } else {
      data[dateStr] = Math.random() > 0.3 ? "updated" : "missed";
    }
  }
  return data;
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const demoData = generateDemoData(year, month);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
    setSelectedDate(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "updated":
        return "bg-green-500 text-white hover:bg-green-600";
      case "missed":
        return "bg-red-500 text-white hover:bg-red-600";
      default:
        return "bg-secondary text-muted-foreground hover:bg-secondary/80";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "updated":
        return <CheckCircle2 className="h-4 w-4" />;
      case "missed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Calculate stats
  const stats = Object.values(demoData).reduce(
    (acc, status) => {
      acc[status]++;
      return acc;
    },
    { updated: 0, missed: 0, pending: 0 }
  );

  const completionRate = Math.round(
    (stats.updated / (stats.updated + stats.missed)) * 100
  ) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <CalendarDays className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Diet Calendar
              </h1>
              <p className="text-muted-foreground">
                Track daily progress and consistency
              </p>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="border-border/50"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {MONTHS[month]} {year}
            </h2>
            <Button
              variant="outline"
              size="icon"
              className="border-border/50"
              onClick={() => navigateMonth(1)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-card border border-border/50 overflow-hidden card-hover animate-fade-in-up stagger-1" style={{ animationFillMode: "forwards" }}>
              <div className="p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells for days before first day of month */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = new Date(year, month, day)
                      .toISOString()
                      .split("T")[0];
                    const status = demoData[dateStr] || "pending";
                    const isSelected = selectedDate === dateStr;
                    const isToday =
                      new Date().toISOString().split("T")[0] === dateStr;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateStr)}
                        className={cn(
                          "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200",
                          getStatusColor(status),
                          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                          isToday && "ring-2 ring-accent"
                        )}
                      >
                        <span className="text-sm font-medium">{day}</span>
                        <span className="opacity-80">{getStatusIcon(status)}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500" />
                    <span className="text-sm text-muted-foreground">Updated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500" />
                    <span className="text-sm text-muted-foreground">Missed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-secondary" />
                    <span className="text-sm text-muted-foreground">Pending/Future</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="rounded-2xl bg-card border border-border/50 p-6 card-hover animate-fade-in-up stagger-2" style={{ animationFillMode: "forwards" }}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Monthly Stats
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Updated Days</span>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    {stats.updated}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Missed Days</span>
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                    {stats.missed}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Remaining</span>
                  <Badge variant="secondary">{stats.pending}</Badge>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-sm text-primary font-bold">
                      {completionRate}%
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
              <div className="rounded-2xl bg-card border border-primary/20 p-6 card-hover animate-fade-in-up">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(demoData[selectedDate])}
                    <span className="capitalize font-medium">
                      {demoData[selectedDate]}
                    </span>
                  </div>

                  {demoData[selectedDate] === "updated" && (
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="text-sm text-green-500">
                        All contacts submitted their diet updates for this day.
                      </p>
                    </div>
                  )}

                  {demoData[selectedDate] === "missed" && (
                    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <p className="text-sm text-red-500">
                        Some contacts missed their diet updates.
                      </p>
                    </div>
                  )}

                  {demoData[selectedDate] === "pending" && (
                    <div className="p-3 bg-secondary rounded-lg border border-border/50">
                      <p className="text-sm text-muted-foreground">
                        This date is in the future. Updates pending.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructions Card */}
            <div className="rounded-2xl bg-secondary/30 border border-border/50 p-6 animate-fade-in-up stagger-3" style={{ animationFillMode: "forwards" }}>
              <h3 className="font-semibold mb-3">Quick Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  Click on any date to see details
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  Green indicates successful updates
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  Aim for consistent green streaks
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
