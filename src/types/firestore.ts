import { Timestamp } from "firebase/firestore";

/**
 * 1. User Profile Collection Document Interface (/users/{userId})
 */
export interface UserDocument {
  uid: string;
  email: string;
  fullName: string;
  bio?: string;
  avatarUrl?: string;
  university?: string;
  major?: string;
  department?: string;
  semester?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  searchKeywords?: string[];
  rating: number;
  completedSwaps: number;
  isOnline: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 2. Project Collection Document Interface (/projects/{projectId})
 */
export interface ProjectDocument {
  projectId: string;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  title: string;
  description: string;
  requiredSkills: string[];
  status: "open" | "in_progress" | "completed" | "closed";
  applicantCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 3. Chat Session Collection Document Interface (/chats/{chatId})
 */
export interface ChatDocument {
  chatId: string;
  participants: string[];
  participantProfiles: Record<string, { name: string; avatarUrl?: string }>;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Timestamp;
  };
  unreadCounts: Record<string, number>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 4. Message Subcollection Document Interface (/chats/{chatId}/messages/{messageId})
 */
export interface MessageDocument {
  messageId: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachments?: Array<{
    url: string;
    fileType: string;
    name: string;
  }>;
  createdAt: Timestamp;
}

/**
 * 5. Connection Request Document Interface (/connections/{connectionId})
 */
export interface ConnectionDocument {
  connectionId: string;
  requesterId: string;
  recipientId: string;
  projectId?: string;
  type: "skill_swap" | "project_application";
  status: "pending" | "accepted" | "declined";
  message?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 6. Notification Document Interface (/notifications/{notificationId})
 */
export interface NotificationDocument {
  notificationId: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  type: "connection_request" | "connection_accepted" | "new_message";
  title: string;
  body: string;
  linkUrl?: string;
  read: boolean;
  createdAt: Timestamp;
}
