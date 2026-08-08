"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { 
  Search, 
  ArrowRight, 
  MessageSquare, 
  MessageCircle,
  Briefcase,
  Home
} from "lucide-react";
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

export default function ChatDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
  }, []);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const matchName = c.otherUser?.name?.toLowerCase().includes(query);
      const matchProject = c.project?.title?.toLowerCase().includes(query);
      const matchMessage = c.latestMessage?.message?.toLowerCase().includes(query);
      return matchName || matchProject || matchMessage;
    });
  }, [conversations, searchQuery]);

  const directMessages = filteredConversations.filter(c => !c.project).slice(0, 5);
  const projectConversations = filteredConversations.filter(c => c.project);

  if (loading) {
    return (
      <div className="flex flex-col h-full p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64 rounded-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4 mt-8">
          <Skeleton className="h-6 w-48 mb-4" />
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-5xl mx-auto w-full space-y-12 animate-in fade-in duration-500">
        
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="flex-1">
            {/* The main Messages heading is now in the sidebar */}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/50 border border-border/50 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow placeholder:text-muted-foreground/70"
              />
            </div>
            
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-border/50 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </div>

        {/* WELCOME AREA */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back 👋</h2>
          <p className="text-lg text-muted-foreground">Stay connected with your collaborators.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-1 gap-12">
          
          {/* RECENT CONVERSATIONS (DIRECT) */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              Recent Conversations
            </h3>
            
            {directMessages.length > 0 ? (
              <div className="space-y-1">
                {directMessages.map((conv) => (
                  <Link 
                    key={conv.id} 
                    href={`/chat/${conv.id}`}
                    className="group flex items-center p-3 hover:bg-muted/30 border border-transparent hover:border-border/50 rounded-xl transition-all duration-200"
                  >
                    <div className="relative">
                      <Avatar src={conv.otherUser.photo} alt={conv.otherUser.name} size="sm" />
                      {conv.hasUnread && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-background rounded-full" />
                      )}
                    </div>
                    
                    <div className="ml-3 flex-1 min-w-0 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h4 className={`text-sm font-medium truncate ${conv.hasUnread ? "text-foreground font-semibold" : "text-foreground/90"}`}>
                            {conv.otherUser.name}
                          </h4>
                          {conv.latestMessage && (
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:inline-block">
                              {formatDistanceToNow(new Date(conv.latestMessage.createdAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-xs truncate ${conv.hasUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {conv.latestMessage?.isDeleted 
                            ? "This message was deleted" 
                            : conv.latestMessage?.message || "No messages yet"}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {conv.latestMessage && (
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap sm:hidden">
                            {formatDistanceToNow(new Date(conv.latestMessage.createdAt), { addSuffix: true })}
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-muted/10 border border-dashed border-border/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/40 mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-1">No conversations yet</h4>
                <p className="text-sm text-muted-foreground">Start connecting with other SkillSwap members.</p>
              </div>
            )}
          </div>

          {/* ACTIVE PROJECT CONVERSATIONS */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              Active Project Conversations
            </h3>
            
            {projectConversations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectConversations.map((conv) => (
                  <Link 
                    key={conv.id} 
                    href={`/workspace/${conv.project!.id}`}
                    className="group flex flex-col p-5 bg-card border border-border/50 rounded-2xl hover:border-primary/40 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                        {conv.project!.title.charAt(0)}
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex items-center gap-2 mb-1">
                        {conv.hasUnread && <div className="w-2 h-2 rounded-full bg-primary" />}
                        <h4 className="font-semibold text-foreground truncate">{conv.project!.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        Project workspace
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-muted/10 border border-dashed border-border/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                <Briefcase className="w-10 h-10 text-muted-foreground/40 mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-1">No project conversations yet</h4>
                <p className="text-sm text-muted-foreground">Join or create a project to start collaborating.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
