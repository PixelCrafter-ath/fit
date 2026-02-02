"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Users, Zap } from "lucide-react";

interface HeroSectionProps {
  totalContacts: number;
  activeContacts: number;
  avgStreak: number;
  onRefresh: () => void;
  onSendReminders: () => void;
  isSending: boolean;
}

export function HeroSection({
  totalContacts,
  activeContacts,
  avgStreak,
  onRefresh,
  onSendReminders,
  isSending,
}: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-8 animate-fade-in-up">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-fitness.jpg"
          alt="Fitness tracking"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 py-12 md:px-12 md:py-16">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30">
              LIVE TRACKING
            </span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight text-balance">
            Your Fitness{" "}
            <span className="gradient-text">Journey</span>{" "}
            Dashboard
          </h1>

          <p className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed">
            Track progress, monitor diet updates, and keep your team motivated with real-time analytics and personalized reminders.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <Button
              onClick={onRefresh}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button
              onClick={onSendReminders}
              disabled={isSending}
              className="bg-primary hover:bg-primary/90 text-white animate-pulse-glow"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isSending ? "Sending..." : "Send Reminders"}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 md:gap-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalContacts}</p>
                <p className="text-sm text-white/60">Total Contacts</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg backdrop-blur-sm">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{activeContacts}</p>
                <p className="text-sm text-white/60">Active Today</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg backdrop-blur-sm">
                <Zap className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{avgStreak}</p>
                <p className="text-sm text-white/60">Avg Streak</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
