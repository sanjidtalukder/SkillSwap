"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { NotificationDocument } from "@/types/firestore";
import { connectionService } from "@/features/profiles/services/connectionService";
import { toast } from "sonner";
import {
  Bell,
  CheckCircle,
  XCircle,
  MessageCircle,
  FolderPlus,
  Rocket,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

interface NotificationItemProps {
  notification: NotificationDocument;
  onClose?: () => void;
  markAsRead?: (id: string) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}

export function NotificationItem({
  notification,
  onClose,
  markAsRead,
  onDelete,
}: NotificationItemProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [actionHandled, setActionHandled] = useState(false);

  const handleContainerClick = () => {
    if (!notification.read && markAsRead) {
      markAsRead(notification.id || notification.notificationId);
    }
    if (notification.linkUrl && notification.type !== "connection_request") {
      router.push(notification.linkUrl);
      onClose?.();
    }
  };

  const handleConnectionAction = async (
    e: React.MouseEvent,
    action: "accept" | "reject"
  ) => {
    e.stopPropagation();
    if (!notification.senderId) return;

    setIsLoading(true);
    const result = await connectionService.updateConnectionStatus(
      notification.senderId,
      action
    );
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error.userMessage);
      return;
    }

    toast.success(
      action === "accept"
        ? "Connection accepted successfully."
        : "Connection request declined."
    );
    setActionHandled(true);
    
    if (!notification.read && markAsRead) {
      markAsRead(notification.id || notification.notificationId);
    }
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.read && markAsRead) {
      markAsRead(notification.id || notification.notificationId);
    }
    if (notification.linkUrl) {
      router.push(notification.linkUrl);
      onClose?.();
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "connection_request":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "connection_accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "connection_rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "message":
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case "project_invite":
        return <FolderPlus className="w-5 h-5 text-orange-500" />;
      case "project_joined":
        return <Rocket className="w-5 h-5 text-cyan-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`relative group flex gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:bg-muted/50 ${
        !notification.read
          ? "bg-blue-500/5 border-blue-500/20"
          : "bg-card border-border/50"
      }`}
    >
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id || notification.notificationId);
          }}
          className="absolute top-2 right-2 p-1 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Delete notification"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}

      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
      )}

      {notification.senderAvatarUrl ? (
        <Avatar
          src={notification.senderAvatarUrl}
          alt={notification.senderName || "User"}
          className="w-10 h-10 border border-border mt-1 shrink-0"
        />
      ) : (
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
      )}

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            !notification.read
              ? "font-semibold text-foreground"
              : "font-medium text-foreground/90"
          }`}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {notification.body}
        </p>
        <p className="text-[10px] text-muted-foreground mt-2">
          {notification.createdAt
            ? formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })
            : "Just now"}
        </p>

        {/* Action Buttons */}
        {notification.type === "connection_request" && !actionHandled && (
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="primary"
              onClick={(e) => handleConnectionAction(e, "accept")}
              disabled={isLoading}
              className="h-8 text-xs px-3"
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => handleConnectionAction(e, "reject")}
              disabled={isLoading}
              className="h-8 text-xs px-3"
            >
              Decline
            </Button>
          </div>
        )}

        {notification.type === "message" && (
          <div className="mt-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleMessageClick}
              className="h-8 text-xs px-3"
            >
              Open Chat
            </Button>
          </div>
        )}

        {notification.type === "project_invite" && notification.linkUrl && (
          <div className="mt-3">
            <Button
              size="sm"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                router.push(notification.linkUrl!);
                onClose?.();
              }}
              className="h-8 text-xs px-3"
            >
              Join Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
