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
  project: {
    id: string;
    title: string;
  } | null;
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
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Direct Messages Section */}
        <div className="p-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Direct Messages</h3>
          {conversations.filter(c => !c.project).length === 0 ? (
            <div className="text-sm text-muted-foreground px-1 mb-4">No direct messages.</div>
          ) : (
            <div className="space-y-1 mb-4">
              {conversations.filter(c => !c.project).map((conv) => {
                const isActive = pathname === `/chat/${conv.id}`;
                return (
                  <Link
                    key={conv.id}
                    href={`/chat/${conv.id}`}
                    className={`flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors ${isActive ? "bg-muted" : ""}`}
                  >
                    <Avatar src={conv.otherUser.photo} alt={conv.otherUser.name} size="sm" className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className={`text-sm font-medium truncate ${conv.hasUnread && !isActive ? "text-primary font-semibold" : ""}`}>
                          {conv.otherUser.name}
                        </h3>
                      </div>
                      <p className={`text-xs truncate ${conv.hasUnread && !isActive ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                        {conv.latestMessage?.isDeleted 
                          ? "This message was deleted" 
                          : conv.latestMessage?.message || "No messages yet"}
                      </p>
                    </div>
                    {conv.hasUnread && !isActive && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Project Workspaces Section */}
        <div className="p-3 border-t border-border/40">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Project Workspaces</h3>
          {conversations.filter(c => c.project).length === 0 ? (
            <div className="text-sm text-muted-foreground px-1">No project workspaces.</div>
          ) : (
            <div className="space-y-1">
              {conversations.filter(c => c.project).map((conv) => (
                <Link
                  key={conv.id}
                  href={`/workspace/${conv.project!.id}`}
                  className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors`}
                >
                  <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                    {conv.project!.title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">
                      {conv.project!.title}
                    </h3>
                  </div>
                  {conv.hasUnread && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
