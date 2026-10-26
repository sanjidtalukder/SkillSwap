"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fetchWithAuth } from "@/lib/api-client";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { MessageCircle, Bookmark, Users, FolderPlus } from "lucide-react";

interface Conversation {
  id: string;
  isSelf?: boolean;
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
  const [selfConversation, setSelfConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function loadData() {
      try {
        const [convRes, selfRes] = await Promise.all([
          fetchWithAuth("/api/chat/conversations"),
          fetchWithAuth("/api/chat/self")
        ]);

        const [convData, selfData] = await Promise.all([
          convRes.json(),
          selfRes.json()
        ]);

        if (selfData.success && selfData.data) {
          setSelfConversation(selfData.data);
        }

        if (convData.success && Array.isArray(convData.data)) {
          // Exclude self conversation from regular list since it will be pinned/promoted
          setConversations(convData.data);
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-2xl font-bold mb-4 tracking-tight flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          Messages
        </h2>
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

  // Combine or filter direct messages
  const directMessages = conversations.filter(c => !c.project && !c.isSelf && c.id !== selfConversation?.id);
  const projectConversations = conversations.filter(c => c.project);

  return (
    <div className="flex flex-col h-full border-r border-border bg-card/40">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Messages
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Direct Messages Section */}
        <div className="p-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Direct Messages
            </h3>
          </div>

          <div className="space-y-1 mb-2">
            {/* Always visible: User's Note to Self */}
            {selfConversation && (() => {
              const isActive = pathname === `/chat/${selfConversation.id}`;
              return (
                <Link
                  key={selfConversation.id}
                  href={`/chat/${selfConversation.id}`}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-150 ${
                    isActive 
                      ? "bg-primary/10 border-primary/30 text-foreground" 
                      : "border-transparent hover:bg-muted/60"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar 
                      src={selfConversation.otherUser.photo} 
                      alt={selfConversation.otherUser.name} 
                      size="sm" 
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-sm">
                      <Bookmark className="w-2.5 h-2.5 fill-current" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-sm font-semibold truncate text-foreground flex items-center gap-1.5">
                        {selfConversation.otherUser.name}
                      </h4>
                    </div>
                    <p className="text-xs truncate text-muted-foreground">
                      {selfConversation.latestMessage?.isDeleted 
                        ? "This message was deleted" 
                        : selfConversation.latestMessage?.message || "Notes, ideas & saved links"}
                    </p>
                  </div>
                </Link>
              );
            })()}

            {/* Other Direct Messages */}
            {directMessages.map((conv) => {
              const isActive = pathname === `/chat/${conv.id}`;
              return (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-150 ${
                    isActive 
                      ? "bg-primary/10 border-primary/30 text-foreground" 
                      : "border-transparent hover:bg-muted/60"
                  }`}
                >
                  <Avatar src={conv.otherUser.photo} alt={conv.otherUser.name} size="sm" className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className={`text-sm font-medium truncate ${conv.hasUnread && !isActive ? "text-primary font-semibold" : ""}`}>
                        {conv.otherUser.name}
                      </h4>
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

          {directMessages.length === 0 && (
            <div className="px-1 py-2">
              <Link
                href="/skills"
                className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-dashed border-border/60 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>Find Collaborators</span>
              </Link>
            </div>
          )}
        </div>
        
        {/* Project Workspaces Section */}
        <div className="p-3 border-t border-border/40">
          <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Project Workspaces
            </h3>
          </div>

          {projectConversations.length === 0 ? (
            <div className="px-1 py-1">
              <Link
                href="/projects"
                className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-dashed border-border/60 transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5 text-primary" />
                <span>Explore Projects</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {projectConversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/workspace/${conv.project!.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:bg-muted/60 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                    {conv.project!.title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {conv.project!.title}
                    </h4>
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
