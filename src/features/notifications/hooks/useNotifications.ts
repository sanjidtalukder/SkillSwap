"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { NotificationDocument } from "@/types/firestore";
import { notificationService } from "../services/notificationService";
import { groupNotifications, GroupedNotifications } from "../utils/groupNotifications";

export function useNotifications(userId?: string | null) {
  const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = notificationService.subscribeToNotifications(
      userId,
      (data) => {
        setNotifications(data);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Derived unread count badge
  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.read).length;
  }, [notifications]);

  // Grouped notifications by timeframe
  const grouped: GroupedNotifications = useMemo(() => {
    return groupNotifications(notifications);
  }, [notifications]);

  // Optimistic Mark As Read
  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic state update
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === notificationId ? { ...n, read: true } : n))
    );
    await notificationService.markAsRead(notificationId);
  }, []);

  // Optimistic Mark All As Read
  const markAllAsRead = useCallback(async () => {
    // Optimistic state update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await notificationService.markAllAsRead(notifications);
  }, [notifications]);

  return {
    notifications,
    grouped,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  };
}
