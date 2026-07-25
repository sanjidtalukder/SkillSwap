import React, { memo } from "react";
import { GroupedNotifications } from "../utils/groupNotifications";
import { NotificationItem } from "./NotificationItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export interface NotificationListGroupProps {
  grouped: GroupedNotifications;
  unreadCount: number;
  onReadItem?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

export const NotificationListGroup = memo(function NotificationListGroup({
  grouped,
  unreadCount,
  onReadItem,
  onMarkAllAsRead,
}: NotificationListGroupProps) {
  const hasNotifications =
    grouped.today.length > 0 ||
    grouped.yesterday.length > 0 ||
    grouped.thisWeek.length > 0 ||
    grouped.older.length > 0;

  if (!hasNotifications) {
    return (
      <EmptyState
        title="No Notifications"
        description="You have no notifications right now. Check back later!"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </span>
        {unreadCount > 0 && onMarkAllAsRead && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary"
            onClick={onMarkAllAsRead}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Today Section */}
      {grouped.today.length > 0 && (
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-foreground/70">
            Today
          </h3>
          <div className="space-y-1">
            {grouped.today.map((item) => (
              <NotificationItem key={item.notificationId} notification={item} onRead={onReadItem} />
            ))}
          </div>
        </div>
      )}

      {/* Yesterday Section */}
      {grouped.yesterday.length > 0 && (
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-foreground/70">
            Yesterday
          </h3>
          <div className="space-y-1">
            {grouped.yesterday.map((item) => (
              <NotificationItem key={item.notificationId} notification={item} onRead={onReadItem} />
            ))}
          </div>
        </div>
      )}

      {/* This Week Section */}
      {grouped.thisWeek.length > 0 && (
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-foreground/70">
            This Week
          </h3>
          <div className="space-y-1">
            {grouped.thisWeek.map((item) => (
              <NotificationItem key={item.notificationId} notification={item} onRead={onReadItem} />
            ))}
          </div>
        </div>
      )}

      {/* Older Section */}
      {grouped.older.length > 0 && (
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-foreground/70">
            Older
          </h3>
          <div className="space-y-1">
            {grouped.older.map((item) => (
              <NotificationItem key={item.notificationId} notification={item} onRead={onReadItem} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
