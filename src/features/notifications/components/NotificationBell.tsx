"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { Button } from "@/components/ui/Button";

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications(user?.uid);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  const displayNotifications = notifications.slice(0, 5); // Show latest 5

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 text-foreground/80 ${unreadCount > 0 ? 'animate-[bounce_0.5s_ease-in-out]' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-[0_0_0_2px_var(--background)]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-screen max-w-sm sm:w-[380px] rounded-xl border border-border/60 bg-background shadow-lg shadow-black/5 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
                Loading...
              </div>
            ) : displayNotifications.length > 0 ? (
              <div className="flex flex-col p-2 space-y-1">
                {displayNotifications.map((notif) => (
                  <NotificationItem
                    key={notif.id || notif.notificationId}
                    notification={notif}
                    markAsRead={markAsRead}
                    onClose={closeDropdown}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="w-10 h-10 text-muted mb-3" />
                <p className="text-sm font-medium">You&apos;re all caught up</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No new notifications
                </p>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-border/40 bg-muted/20">
            <Link href="/notifications" className="block w-full">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm font-medium"
                onClick={() => closeDropdown()}
              >
                View All Notifications →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
