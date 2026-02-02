"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  Settings,
  Bell,
  User,
  CalendarDays,
  AlertTriangle,
  RefreshCw,
  Save,
  Clock,
  Globe,
  Phone,
  CheckCircle2,
  Info,
} from "lucide-react";

const timezones = [
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
];

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const handleSave = async (section: string) => {
    setIsSaving(section);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(null);
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              System Settings
            </h1>
            <p className="text-muted-foreground">
              Configure reminders, admin info, and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Accordion
              type="single"
              collapsible
              defaultValue="reminder"
              className="space-y-4"
            >
              {/* Reminder Settings */}
              <AccordionItem
                value="reminder"
                className="rounded-2xl bg-card border border-border/50 overflow-hidden card-hover animate-fade-in-up stagger-1"
                style={{ animationFillMode: "forwards" }}
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Bell className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Reminder Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure daily reminder time and timezone
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="reminder-time"
                        className="flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Daily Reminder Time
                      </Label>
                      <Input
                        id="reminder-time"
                        type="time"
                        defaultValue="18:00"
                        className="bg-secondary/50 border-border/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        24-hour format (e.g., 18:00 = 6 PM)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="timezone"
                        className="flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        Timezone
                      </Label>
                      <Select defaultValue="Asia/Kolkata">
                        <SelectTrigger className="bg-secondary/50 border-border/50">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    className="mt-6 bg-blue-500 hover:bg-blue-600"
                    onClick={() => handleSave("reminder")}
                    disabled={isSaving === "reminder"}
                  >
                    {isSaving === "reminder" ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : savedSection === "reminder" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Reminder Settings
                      </>
                    )}
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Admin Settings */}
              <AccordionItem
                value="admin"
                className="rounded-2xl bg-card border border-border/50 overflow-hidden card-hover animate-fade-in-up stagger-2"
                style={{ animationFillMode: "forwards" }}
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <User className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Admin Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure admin contact information
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="admin-name"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        Admin Name
                      </Label>
                      <Input
                        id="admin-name"
                        placeholder="Enter admin name"
                        defaultValue="John Admin"
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="admin-phone"
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Admin Phone Number
                      </Label>
                      <Input
                        id="admin-phone"
                        placeholder="+1234567890"
                        defaultValue="+1 (555) 000-0000"
                        className="bg-secondary/50 border-border/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        For receiving daily summaries
                      </p>
                    </div>
                  </div>

                  <Button
                    className="mt-6 bg-green-500 hover:bg-green-600"
                    onClick={() => handleSave("admin")}
                    disabled={isSaving === "admin"}
                  >
                    {isSaving === "admin" ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : savedSection === "admin" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Admin Settings
                      </>
                    )}
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Weekly Summary Settings */}
              <AccordionItem
                value="weekly"
                className="rounded-2xl bg-card border border-border/50 overflow-hidden card-hover animate-fade-in-up stagger-3"
                style={{ animationFillMode: "forwards" }}
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <CalendarDays className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Weekly Summary Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure when weekly summaries are sent
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="weekly-day"
                      className="flex items-center gap-2"
                    >
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      Weekly Summary Day
                    </Label>
                    <Select defaultValue="sunday">
                      <SelectTrigger className="bg-secondary/50 border-border/50 max-w-xs">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunday">Sunday</SelectItem>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Day when weekly summaries will be generated and sent
                    </p>
                  </div>

                  <Button
                    className="mt-6 bg-purple-500 hover:bg-purple-600"
                    onClick={() => handleSave("weekly")}
                    disabled={isSaving === "weekly"}
                  >
                    {isSaving === "weekly" ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : savedSection === "weekly" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Weekly Settings
                      </>
                    )}
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Danger Zone */}
            <div className="rounded-2xl bg-card border border-red-500/30 overflow-hidden card-hover animate-fade-in-up stagger-4" style={{ animationFillMode: "forwards" }}>
              <div className="px-6 py-4 border-b border-red-500/30 bg-red-500/5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h3 className="font-semibold text-red-500">Danger Zone</h3>
                </div>
              </div>
              <div className="px-6 py-6">
                <p className="text-muted-foreground mb-4">
                  Reset all settings to their default values. This action cannot
                  be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset All Settings
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reset all settings to their default values.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-500 hover:bg-red-600">
                        Yes, reset all settings
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Help Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-6 card-hover animate-fade-in-up stagger-2" style={{ animationFillMode: "forwards" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Settings Guide</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">Reminder Settings</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                      Set when daily reminders are sent
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                      Choose appropriate timezone
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">Admin Settings</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                      Admin receives daily summaries
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                      Used for system notifications
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">Weekly Summary</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                      Choose day for weekly reports
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                      Summaries sent to all users
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-yellow-500/5 border border-yellow-500/20 p-6 animate-fade-in-up stagger-3" style={{ animationFillMode: "forwards" }}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-500 mb-2">
                    Important Notes
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>Changes take effect immediately</li>
                    <li>Cron jobs adjust automatically</li>
                    <li>Test settings in development first</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
