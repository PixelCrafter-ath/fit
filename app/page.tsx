"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { StatCard } from "@/components/stat-card";
import { ContactList } from "@/components/contact-list";
import { WeeklyProgress } from "@/components/weekly-progress";
import { Users, CheckCircle2, XCircle, Flame } from "lucide-react";

// Demo data - replace with actual API calls
const demoStats = {
  totalContacts: 24,
  activeContacts: 18,
  todayUpdated: 15,
  todayMissed: 3,
  avgStreak: 7,
  weeklyData: {
    totalUpdates: 126,
    avgPerContact: 5.2,
    completionRate: 78,
    weekStart: "Jan 27",
    weekEnd: "Feb 2",
  },
};

const demoUpdatedContacts = [
  { id: "1", name: "Sarah Johnson", phone: "+1 (555) 123-4567", streak: 12, status: "updated" as const },
  { id: "2", name: "Mike Chen", phone: "+1 (555) 234-5678", streak: 8, status: "updated" as const },
  { id: "3", name: "Emily Davis", phone: "+1 (555) 345-6789", streak: 15, status: "updated" as const },
  { id: "4", name: "James Wilson", phone: "+1 (555) 456-7890", streak: 5, status: "updated" as const },
  { id: "5", name: "Lisa Anderson", phone: "+1 (555) 567-8901", streak: 3, status: "updated" as const },
];

const demoMissedContacts = [
  { id: "6", name: "Tom Brown", phone: "+1 (555) 678-9012", streak: 0, status: "missed" as const },
  { id: "7", name: "Amy Martinez", phone: "+1 (555) 789-0123", streak: 2, status: "missed" as const },
  { id: "8", name: "David Lee", phone: "+1 (555) 890-1234", streak: 1, status: "missed" as const },
];

export default function DashboardPage() {
  const [isSending, setIsSending] = useState(false);

  const handleRefresh = () => {
    // Implement refresh logic
    window.location.reload();
  };

  const handleSendReminders = async () => {
    setIsSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSending(false);
    alert("Reminders sent successfully!");
  };

  const participationRate = Math.round(
    (demoStats.todayUpdated / demoStats.totalContacts) * 100
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <HeroSection
          totalContacts={demoStats.totalContacts}
          activeContacts={demoStats.activeContacts}
          avgStreak={demoStats.avgStreak}
          onRefresh={handleRefresh}
          onSendReminders={handleSendReminders}
          isSending={isSending}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Contacts"
            value={demoStats.totalContacts}
            subtitle={`${demoStats.activeContacts} active`}
            icon={Users}
            variant="primary"
            delay={100}
          />
          <StatCard
            title="Today's Updates"
            value={demoStats.todayUpdated}
            subtitle={`${participationRate}% participation`}
            icon={CheckCircle2}
            trend={{ value: 12, isPositive: true }}
            variant="success"
            delay={200}
          />
          <StatCard
            title="Missed Today"
            value={demoStats.todayMissed}
            subtitle="Need follow-up"
            icon={XCircle}
            variant="danger"
            delay={300}
          />
          <StatCard
            title="Avg Streak"
            value={`${demoStats.avgStreak} days`}
            subtitle="Daily streak average"
            icon={Flame}
            trend={{ value: 5, isPositive: true }}
            variant="warning"
            delay={400}
          />
        </div>

        {/* Contact Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ContactList
            title={`Updated Today (${demoUpdatedContacts.length})`}
            contacts={demoUpdatedContacts}
            variant="success"
            emptyMessage="No updates received today"
          />
          <ContactList
            title={`Not Updated Today (${demoMissedContacts.length})`}
            contacts={demoMissedContacts}
            variant="danger"
            emptyMessage="Everyone updated today!"
          />
        </div>

        {/* Weekly Progress */}
        <WeeklyProgress
          totalUpdates={demoStats.weeklyData.totalUpdates}
          avgPerContact={demoStats.weeklyData.avgPerContact}
          completionRate={demoStats.weeklyData.completionRate}
          weekStart={demoStats.weeklyData.weekStart}
          weekEnd={demoStats.weeklyData.weekEnd}
        />
      </main>
    </div>
  );
}
