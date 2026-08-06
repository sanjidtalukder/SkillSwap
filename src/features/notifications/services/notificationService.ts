/**
 * Client-safe notificationService.
 * All DB operations go through API routes — NO Prisma, NO server imports.
 */
import { ServiceResult } from "@/services/baseService";
import { fetchWithAuth } from "@/lib/api-client";

export const notificationService = {
  async subscribeToNotifications(
    userId: string,
    onData: (notifications: any[]) => void,
    onError?: (err: Error) => void
  ) {
    try {
      const response = await fetchWithAuth("/api/notifications");
      if (!response.ok) {
        const data = await response.json();
        onError?.(new Error(data.error || "Failed to fetch notifications"));
        return () => {};
      }
      const data = await response.json();
      onData(data.notifications || []);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error("Failed to fetch notifications"));
    }

    // Return a no-op unsubscribe function (polling not implemented)
    return () => {};
  },

  async markAsRead(notificationId: string): Promise<ServiceResult<void>> {
    try {
      const response = await fetchWithAuth(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          data: null,
          error: {
            userMessage: data.error || "Failed to mark notification as read.",
            code: "notification_error",
            message: data.error || "Failed to mark notification as read.",
            statusCode: response.status,
          },
        };
      }

      return { data: undefined, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          userMessage: "Failed to mark notification as read.",
          code: "notification_error",
          message: error instanceof Error ? error.message : "Unknown error",
          statusCode: 500,
        },
      };
    }
  },

  async markAllAsRead(notifications: any[]): Promise<ServiceResult<void>> {
    try {
      const unreadIds = notifications
        .filter((n) => !n.read)
        .map((n) => n.id || n.notificationId);

      if (unreadIds.length === 0) return { data: undefined, error: null };

      const response = await fetchWithAuth("/api/notifications/read-all", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: unreadIds }),
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          data: null,
          error: {
            userMessage: data.error || "Failed to mark all notifications as read.",
            code: "notification_error",
            message: data.error || "Failed to mark all notifications as read.",
            statusCode: response.status,
          },
        };
      }

      return { data: undefined, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          userMessage: "Failed to mark all notifications as read.",
          code: "notification_error",
          message: error instanceof Error ? error.message : "Unknown error",
          statusCode: 500,
        },
      };
    }
  },
};