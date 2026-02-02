"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileJson,
  TrendingUp,
  Calendar,
  Target,
  Flame,
  RefreshCw,
} from "lucide-react";

// Demo data
const weeklySummaries = [
  { id: 1, week: "Jan 27 - Feb 2", contact: "Sarah Johnson", phone: "+1 (555) 123-4567", daysUpdated: 7, daysMissed: 0, completionRate: 100, streak: 12 },
  { id: 2, week: "Jan 27 - Feb 2", contact: "Mike Chen", phone: "+1 (555) 234-5678", daysUpdated: 6, daysMissed: 1, completionRate: 86, streak: 8 },
  { id: 3, week: "Jan 27 - Feb 2", contact: "Emily Davis", phone: "+1 (555) 345-6789", daysUpdated: 7, daysMissed: 0, completionRate: 100, streak: 15 },
  { id: 4, week: "Jan 20 - Jan 26", contact: "Sarah Johnson", phone: "+1 (555) 123-4567", daysUpdated: 5, daysMissed: 2, completionRate: 71, streak: 5 },
  { id: 5, week: "Jan 20 - Jan 26", contact: "Mike Chen", phone: "+1 (555) 234-5678", daysUpdated: 4, daysMissed: 3, completionRate: 57, streak: 2 },
  { id: 6, week: "Jan 13 - Jan 19", contact: "Emily Davis", phone: "+1 (555) 345-6789", daysUpdated: 6, daysMissed: 1, completionRate: 86, streak: 8 },
];

const chartData = [
  { week: "Week 1", updates: 45, rate: 65 },
  { week: "Week 2", updates: 52, rate: 74 },
  { week: "Week 3", updates: 61, rate: 82 },
  { week: "Week 4", updates: 58, rate: 78 },
];

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: string, type: string) => {
    setIsExporting(true);
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsExporting(false);
    alert(`Exported ${type} as ${format.toUpperCase()}`);
  };

  // Calculate overall stats
  const avgCompletionRate = Math.round(
    weeklySummaries.reduce((sum, s) => sum + s.completionRate, 0) / weeklySummaries.length
  );
  const totalUpdates = weeklySummaries.reduce((sum, s) => sum + s.daysUpdated, 0);
  const weeksTracked = new Set(weeklySummaries.map((s) => s.week)).size;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Image */}
        <div className="relative overflow-hidden rounded-3xl mb-8 animate-fade-in-up">
          <div className="absolute inset-0">
            <Image
              src="/images/healthy-nutrition.jpg"
              alt="Reports and analytics"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
          </div>

          <div className="relative z-10 px-8 py-12 md:px-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Reports & Analytics
                  </h1>
                </div>
                <p className="text-muted-foreground max-w-md">
                  Analyze performance trends, track weekly progress, and export detailed reports.
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Download className="h-4 w-4 mr-2" />
                    Export Reports
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Export as CSV</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleExport("csv", "contacts")}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Contacts CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("csv", "summaries")}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Weekly Summaries CSV
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Export as JSON</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleExport("json", "contacts")}>
                    <FileJson className="h-4 w-4 mr-2" />
                    Contacts JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("json", "messages")}>
                    <FileJson className="h-4 w-4 mr-2" />
                    Messages JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Performance Chart (Visual representation) */}
        <div className="rounded-2xl bg-card border border-border/50 p-6 mb-8 card-hover animate-fade-in-up stagger-1" style={{ animationFillMode: "forwards" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Trends
            </h2>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Simple Bar Chart Visualization */}
          <div className="flex items-end justify-between gap-4 h-48 mb-4">
            {chartData.map((data, index) => (
              <div key={data.week} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full flex gap-1 h-full items-end">
                  {/* Updates bar */}
                  <div
                    className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-500 opacity-0 animate-fade-in-up"
                    style={{
                      height: `${(data.updates / 70) * 100}%`,
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: "forwards",
                    }}
                  />
                  {/* Rate bar */}
                  <div
                    className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 opacity-0 animate-fade-in-up"
                    style={{
                      height: `${data.rate}%`,
                      animationDelay: `${index * 100 + 50}ms`,
                      animationFillMode: "forwards",
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{data.week}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-sm text-muted-foreground">Total Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-sm text-muted-foreground">Completion %</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-2xl bg-card border border-border/50 p-6 text-center card-hover animate-fade-in-up stagger-2" style={{ animationFillMode: "forwards" }}>
            <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <p className="text-4xl font-bold text-foreground mb-1">
              {avgCompletionRate}%
            </p>
            <p className="text-muted-foreground">Average Completion Rate</p>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-6 text-center card-hover animate-fade-in-up stagger-3" style={{ animationFillMode: "forwards" }}>
            <div className="inline-flex p-3 bg-blue-500/10 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-4xl font-bold text-foreground mb-1">{weeksTracked}</p>
            <p className="text-muted-foreground">Weeks Tracked</p>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-6 text-center card-hover animate-fade-in-up stagger-4" style={{ animationFillMode: "forwards" }}>
            <div className="inline-flex p-3 bg-green-500/10 rounded-full mb-4">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-4xl font-bold text-foreground mb-1">{totalUpdates}</p>
            <p className="text-muted-foreground">Total Updates Recorded</p>
          </div>
        </div>

        {/* Weekly Summaries Table */}
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden card-hover animate-fade-in-up stagger-5" style={{ animationFillMode: "forwards" }}>
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Weekly Summaries</h2>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border/50 bg-secondary/30">
                <TableHead className="text-muted-foreground font-semibold">Week</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Contact</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Phone</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Days Updated</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Days Missed</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Completion</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Streak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeklySummaries.map((summary, index) => (
                <TableRow
                  key={summary.id}
                  className="border-border/50 hover:bg-secondary/20 transition-colors animate-fade-in-up opacity-0"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  <TableCell>
                    <span className="font-medium">{summary.week}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {summary.contact.charAt(0)}
                      </div>
                      <span>{summary.contact}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {summary.phone}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      {summary.daysUpdated}/7
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "border",
                        summary.daysMissed === 0
                          ? "bg-secondary text-muted-foreground border-border"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      )}
                    >
                      {summary.daysMissed}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={summary.completionRate}
                        className="h-2 w-20 bg-secondary"
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          summary.completionRate >= 80
                            ? "text-green-500"
                            : summary.completionRate >= 50
                            ? "text-yellow-500"
                            : "text-red-500"
                        )}
                      >
                        {summary.completionRate}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Flame
                        className={cn(
                          "h-4 w-4",
                          summary.streak >= 7
                            ? "text-orange-500"
                            : summary.streak >= 3
                            ? "text-yellow-500"
                            : "text-muted-foreground"
                        )}
                      />
                      <span>{summary.streak} days</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
