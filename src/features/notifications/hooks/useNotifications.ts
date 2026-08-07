"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { NotificationDocument } from "@/types/firestore";
import { notificationService } from "../services/notificationService";
import { groupNotifications, GroupedNotifications } from "../utils/groupNotifications";

export function useNotifications(userId?: string | null) {
  const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    cancelledRef.current = false;
    setIsLoading(true);
    setError(null);

    notificationService
      .subscribeToNotifications(
        userId,
        (data) => {
          if (!cancelledRef.current) {
            setNotifications(data);
            setIsLoading(false);
          }
        },
        (err) => {
          if (!cancelledRef.current) {
            setError(err.message);
            setIsLoading(false);
          }
        }
      )
      .catch((err: unknown) => {
        if (!cancelledRef.current) {
          setError(err instanceof Error ? err.message : "Failed to load notifications");
          setIsLoading(false);
        }
      });

    return () => {
      cancelledRef.current = true;
    };
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

  // Optimistic Delete Notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    // Optimistic state update
    setNotifications((prev) => prev.filter((n) => (n.id || n.notificationId) !== notificationId));
    await notificationService.deleteNotification(notificationId);
  }, []);

  return {
    notifications,
    grouped,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
