"use client";

import React from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { NotificationItem } from "@/features/notifications/components/NotificationItem";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Bell, Check } from "lucide-react";
import { CardSkeleton } from "@/components/ui/CardSkeleton";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { grouped, unreadCount, markAsRead, markAllAsRead, isLoading } =
    useNotifications(user?.uid);

  const groupedArray = [
    { timeframe: "Today", items: grouped.today },
    { timeframe: "Yesterday", items: grouped.yesterday },
    { timeframe: "This Week", items: grouped.thisWeek },
    { timeframe: "Older", items: grouped.older },
  ].filter((g) => g.items.length > 0);

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

        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton count={3} />
          </div>
        ) : groupedArray.length > 0 ? (
          <div className="space-y-8">
            {groupedArray.map((group) => (
              <section key={group.timeframe} className="space-y-4">
                <h2 className="text-lg font-semibold border-b border-border/40 pb-2">
                  {group.timeframe}
                </h2>
                <div className="space-y-2">
                  {group.items.map((notif) => (
                    <NotificationItem
                      key={notif.id || notif.notificationId}
                      notification={notif}
                      markAsRead={markAsRead}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl border-border/60 bg-card/30">
            <Bell className="w-16 h-16 text-muted mb-4" />
            <h2 className="text-xl font-bold">You&apos;re all caught up</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
              When you get connection requests, messages, or project invites, they&apos;ll show up here.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
