"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Flame } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  streak: number;
  status: "updated" | "missed";
}

interface ContactListProps {
  title: string;
  contacts: Contact[];
  variant: "success" | "danger";
  emptyMessage?: string;
}

export function ContactList({
  title,
  contacts,
  variant,
  emptyMessage = "No contacts",
}: ContactListProps) {
  const headerStyles = {
    success: "bg-green-500/10 text-green-500 border-green-500/20",
    danger: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const iconStyles = {
    success: <CheckCircle2 className="h-5 w-5" />,
    danger: <XCircle className="h-5 w-5" />,
  };

  return (
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden card-hover">
      <div
        className={cn(
          "px-6 py-4 border-b flex items-center gap-3",
          headerStyles[variant]
        )}
      >
        {iconStyles[variant]}
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary" className="ml-auto">
          {contacts.length}
        </Badge>
      </div>

      <div className="divide-y divide-border/50">
        {contacts.length > 0 ? (
          contacts.map((contact, index) => (
            <div
              key={contact.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors animate-fade-in-up opacity-0"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: "forwards",
              }}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                      variant === "success"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-500"
                    )}
                  >
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  {contact.streak > 3 && (
                    <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-0.5">
                      <Flame className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <Badge
                    variant={variant === "success" ? "default" : "destructive"}
                    className={cn(
                      "mb-1",
                      variant === "success"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}
                  >
                    {variant === "success" ? "Updated" : "Missed"}
                  </Badge>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {contact.streak} day streak
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
