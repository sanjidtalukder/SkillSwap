import React, { memo } from "react";
import { NotificationDocument } from "@/types/firestore";
import { Avatar } from "@/components/ui/Avatar";
import { formatNotificationTime } from "../utils/groupNotifications";
import { cn } from "@/utils";

export interface NotificationItemProps {
  notification: NotificationDocument;
  onRead?: (id: string) => void;
}

export const NotificationItem = memo(function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read && onRead) {
      onRead(notification.notificationId);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group flex cursor-pointer items-start gap-3.5 rounded-lg border border-transparent p-3.5 transition-all duration-150 hover:border-border/60 hover:bg-card/60",
        !notification.read ? "border-primary/10 bg-primary/5 font-medium" : "opacity-80"
      )}
    >
      <Avatar
        src={notification.senderAvatarUrl}
        alt={notification.senderName || "Notification"}
        size="md"
      />

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <h4 className="truncate text-xs font-semibold text-foreground">{notification.title}</h4>
          <span className="whitespace-nowrap text-[10px] text-muted-foreground">
            {formatNotificationTime(notification.createdAt)}
          </span>
        </div>

        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {notification.body}
        </p>
      </div>

      {!notification.read && (
        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" title="Unread" />
      )}
    </div>
  );
});
