"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Flame,
  Users,
  UserCheck,
  Bell,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  language: "en" | "hi";
  userType: "general" | "weight_loss" | "diabetic";
  reminderEnabled: boolean;
  active: boolean;
  streak: number;
}

const demoContacts: Contact[] = [
  { id: "1", name: "Sarah Johnson", phone: "+1 (555) 123-4567", language: "en", userType: "weight_loss", reminderEnabled: true, active: true, streak: 12 },
  { id: "2", name: "Mike Chen", phone: "+1 (555) 234-5678", language: "en", userType: "general", reminderEnabled: true, active: true, streak: 8 },
  { id: "3", name: "Emily Davis", phone: "+1 (555) 345-6789", language: "en", userType: "diabetic", reminderEnabled: true, active: true, streak: 15 },
  { id: "4", name: "James Wilson", phone: "+1 (555) 456-7890", language: "hi", userType: "general", reminderEnabled: false, active: true, streak: 5 },
  { id: "5", name: "Lisa Anderson", phone: "+1 (555) 567-8901", language: "en", userType: "weight_loss", reminderEnabled: true, active: false, streak: 3 },
  { id: "6", name: "Tom Brown", phone: "+1 (555) 678-9012", language: "en", userType: "general", reminderEnabled: true, active: true, streak: 0 },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(demoContacts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  const activeCount = contacts.filter((c) => c.active).length;

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      setContacts(contacts.filter((c) => c.id !== id));
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
  };

  const getUserTypeBadge = (type: string) => {
    const styles = {
      general: "bg-secondary text-muted-foreground",
      weight_loss: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      diabetic: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return styles[type as keyof typeof styles] || styles.general;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Image */}
        <div className="relative overflow-hidden rounded-3xl mb-8 animate-fade-in-up">
          <div className="absolute inset-0">
            <Image
              src="/images/strength-training.jpg"
              alt="Contact management"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
          </div>

          <div className="relative z-10 px-8 py-12 md:px-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Contact Management
                  </h1>
                </div>
                <p className="text-muted-foreground max-w-md">
                  Manage your fitness tracking contacts, set reminders, and track their progress.
                </p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-primary hover:bg-primary/90 animate-pulse-glow"
                    onClick={() => setEditingContact(null)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <ContactDialog
                  contact={editingContact}
                  onClose={() => setIsDialogOpen(false)}
                />
              </Dialog>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center gap-3 px-4 py-2 bg-secondary/50 rounded-xl backdrop-blur-sm">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{contacts.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 rounded-xl backdrop-blur-sm border border-green-500/20">
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-500">{activeCount}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in-up stagger-1" style={{ animationFillMode: "forwards" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border/50"
            />
          </div>
          <Button variant="outline" className="border-border/50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Contacts Table */}
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden card-hover animate-fade-in-up stagger-2" style={{ animationFillMode: "forwards" }}>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 bg-secondary/30">
                <TableHead className="text-muted-foreground font-semibold">Name</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Phone</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Language</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Type</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Streak</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact, index) => (
                <TableRow
                  key={contact.id}
                  className="border-border/50 hover:bg-secondary/20 transition-colors animate-fade-in-up opacity-0"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {contact.name.charAt(0)}
                      </div>
                      <span className="font-medium">{contact.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{contact.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "border",
                          contact.active
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-secondary text-muted-foreground border-border"
                        )}
                      >
                        {contact.active ? "Active" : "Inactive"}
                      </Badge>
                      {contact.reminderEnabled && (
                        <Bell className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-border/50">
                      {contact.language === "en" ? "English" : "Hindi"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("border", getUserTypeBadge(contact.userType))}>
                      {contact.userType.replace("_", " ").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Flame
                        className={cn(
                          "h-4 w-4",
                          contact.streak > 0 ? "text-orange-500" : "text-muted-foreground"
                        )}
                      />
                      <span className={contact.streak > 0 ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {contact.streak} days
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-secondary"
                        onClick={() => handleEdit(contact)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => handleDelete(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredContacts.length === 0 && (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No contacts found</p>
              <Button
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Contact
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ContactDialog({
  contact,
  onClose,
}: {
  contact: Contact | null;
  onClose: () => void;
}) {
  const isEditing = !!contact;

  return (
    <DialogContent className="bg-card border-border/50 sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Contact" : "Add New Contact"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the contact information below."
            : "Enter the details for the new contact."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              defaultValue={contact?.name}
              placeholder="Enter full name"
              className="bg-secondary/50 border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              defaultValue={contact?.phone}
              placeholder="+1234567890"
              className="bg-secondary/50 border-border/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue={contact?.language || "en"}>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="userType">User Type</Label>
            <Select defaultValue={contact?.userType || "general"}>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="diabetic">Diabetic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="reminders"
              defaultChecked={contact?.reminderEnabled ?? true}
            />
            <Label htmlFor="reminders">Enable Reminders</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="active" defaultChecked={contact?.active ?? true} />
            <Label htmlFor="active">Active</Label>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="bg-primary hover:bg-primary/90" onClick={onClose}>
          {isEditing ? "Update Contact" : "Add Contact"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
