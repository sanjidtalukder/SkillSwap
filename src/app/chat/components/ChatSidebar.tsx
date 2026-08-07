"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fetchWithAuth } from "@/lib/api-client";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    firebaseUid: string;
    name: string;
    photo: string;
  };
  hasUnread: boolean;
  latestMessage: {
    message: string;
    createdAt: string;
    isDeleted: boolean;
    senderId: string;
  } | null;
  updatedAt: string;
}

export default function ChatSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function loadConversations() {
      try {
        const response = await fetchWithAuth("/api/chat/conversations");
        const data = await response.json();
        if (data.success) {
          setConversations(data.data);
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
    
    // Simple polling for new messages could go here
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground mt-10">
            No conversations yet.
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = pathname === `/chat/${conv.id}`;
            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className={`flex items-start gap-3 p-4 border-b border-border hover:bg-muted/50 transition-colors ${isActive ? "bg-muted" : ""}`}
              >
                <Avatar src={conv.otherUser.photo} alt={conv.otherUser.name} size="md" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-semibold truncate ${conv.hasUnread && !isActive ? "text-primary" : ""}`}>
                      {conv.otherUser.name}
                    </h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${conv.hasUnread && !isActive ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                    {conv.latestMessage?.isDeleted 
                      ? "This message was deleted" 
                      : conv.latestMessage?.message || "No messages yet"}
                  </p>
                </div>
                {conv.hasUnread && !isActive && (
                  <div className="w-2.5 h-2.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
