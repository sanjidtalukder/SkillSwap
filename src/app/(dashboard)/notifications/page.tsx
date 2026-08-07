"use client";

import React, { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { NotificationItem } from "@/features/notifications/components/NotificationItem";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Bell, Check } from "lucide-react";
import { CardSkeleton } from "@/components/ui/CardSkeleton";

type FilterType = "all" | "unread" | "read" | "connections" | "messages";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, isLoading } =
    useNotifications(user?.uid);
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "read") return notif.read;
    if (filter === "connections") return notif.type.includes("connection");
    if (filter === "messages") return notif.type === "message";
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-3xl flex-1 space-y-6 p-6 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
                  {unreadCount} new
                </span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-sm font-medium text-primary hover:underline flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {(["all", "unread", "read", "connections", "messages"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton count={3} />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notif) => (
              <NotificationItem
                key={notif.id || notif.notificationId}
                notification={notif}
                markAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl border-border/60 bg-card/30">
            <Bell className="w-16 h-16 text-muted mb-4" />
            <h2 className="text-xl font-bold">You&apos;re all caught up</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
              {filter === "all" 
                ? "When you get connection requests, messages, or project invites, they'll show up here."
                : `No ${filter} notifications found.`}
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
