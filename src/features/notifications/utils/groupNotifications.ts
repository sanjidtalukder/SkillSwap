import { NotificationDocument } from "@/types/firestore";

export interface GroupedNotifications {
  today: NotificationDocument[];
  yesterday: NotificationDocument[];
  thisWeek: NotificationDocument[];
  older: NotificationDocument[];
}

/**
 * Formats Firestore timestamps into human-readable relative time-ago strings.
 */
export function formatNotificationTime(timestamp: unknown): string {
  if (!timestamp) return "Just now";

  const date =
    typeof timestamp === "object" && timestamp !== null && "toDate" in timestamp
      ? (timestamp as { toDate: () => Date }).toDate()
      : new Date(timestamp as string | number);

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return "Yesterday";
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Groups notifications deterministically by timeframe: Today, Yesterday, This Week, and Older.
 */
export function groupNotifications(notifications: NotificationDocument[]): GroupedNotifications {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  const startOfThisWeek = new Date(startOfToday.getTime() - 6 * 86400000);

  const grouped: GroupedNotifications = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  notifications.forEach((item) => {
    const itemDate =
      typeof item.createdAt === "object" && item.createdAt !== null && "toDate" in item.createdAt
        ? item.createdAt.toDate()
        : new Date(item.createdAt as unknown as string);

    if (itemDate >= startOfToday) {
      grouped.today.push(item);
    } else if (itemDate >= startOfYesterday) {
      grouped.yesterday.push(item);
    } else if (itemDate >= startOfThisWeek) {
      grouped.thisWeek.push(item);
    } else {
      grouped.older.push(item);
    }
  });

  return grouped;
}
