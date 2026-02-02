"use client";

import { Progress } from "@/components/ui/progress";
import { TrendingUp, Calendar, CheckCircle2, Target } from "lucide-react";

interface WeeklyProgressProps {
  totalUpdates: number;
  avgPerContact: number;
  completionRate: number;
  weekStart: string;
  weekEnd: string;
}

export function WeeklyProgress({
  totalUpdates,
  avgPerContact,
  completionRate,
  weekStart,
  weekEnd,
}: WeeklyProgressProps) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden card-hover animate-fade-in-up opacity-0 stagger-4" style={{ animationFillMode: "forwards" }}>
      <div className="px-6 py-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">This Week{"'"}s Progress</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {weekStart} - {weekEnd}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Updates */}
          <div className="text-center p-4 rounded-xl bg-secondary/30">
            <div className="inline-flex p-3 bg-blue-500/10 rounded-full mb-3">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">{totalUpdates}</p>
            <p className="text-sm text-muted-foreground">Total Updates</p>
          </div>

          {/* Avg per Contact */}
          <div className="text-center p-4 rounded-xl bg-secondary/30">
            <div className="inline-flex p-3 bg-green-500/10 rounded-full mb-3">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">{avgPerContact}</p>
            <p className="text-sm text-muted-foreground">Avg per Contact</p>
          </div>

          {/* Completion Rate */}
          <div className="text-center p-4 rounded-xl bg-secondary/30">
            <div className="inline-flex p-3 bg-primary/10 rounded-full mb-3">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{completionRate}%</p>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col justify-center p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Weekly Goal</span>
              <span className="text-sm text-muted-foreground">{completionRate}%</span>
            </div>
            <Progress 
              value={completionRate} 
              className="h-3 bg-secondary"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {completionRate >= 80 
                ? "Excellent progress this week!"
                : completionRate >= 50 
                ? "Good progress, keep going!"
                : "Let's push harder this week!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
