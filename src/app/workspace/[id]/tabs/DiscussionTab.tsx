"use client";

import { useEffect, useState, useRef } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { format, isSameDay } from "date-fns";
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreHorizontal, 
  Reply, 
  MessageSquare,
  FileIcon,
  ImageIcon
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchWithAuth } from "@/lib/api-client";
import { toast } from "sonner";

export function DiscussionTab({ project, user }: { project: any, user: any }) {
  const conversationId = project?.conversation?.id;
  const [messages, setMessages] = useState<any[]>(
    // Sort chronological: the API returns desc, we want asc
    [...(project?.conversation?.messages || [])].reverse()
  );
  
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!conversationId) return;

    scrollToBottom();

    const fetchMessages = async () => {
      try {
        const response = await fetchWithAuth(`/api/chat/conversations/${conversationId}/messages`);
        const data = await response.json();
        if (data.success) {
          // data.data is chronological asc 
          setMessages(data.data);
        }
      } catch (error) {
        console.error("Failed to load messages", error);
      }
    };

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || isSending) return;
    
    if (!conversationId) {
      toast.error("Conversation not initialized.");
      return;
    }

    const text = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      const response = await fetchWithAuth(`/api/chat/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message: text, type: "text" })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        scrollToBottom();
      }
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
            {project.title.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              # {project.title}
            </h2>
            <p className="text-sm text-muted-foreground">{project.members.length + 1} members</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="w-8 h-8 opacity-50" />
            </div>
            <p>Welcome to the beginning of the <strong># {project.title}</strong> discussion!</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMine = msg.sender.firebaseUid === user?.uid;
          
          // Determine if we need a date separator
          const prevMsg = idx > 0 ? messages[idx - 1] : null;
          const showDateSeparator = !prevMsg || !isSameDay(new Date(msg.createdAt), new Date(prevMsg.createdAt));
          
          return (
            <div key={msg.id}>
              {showDateSeparator && (
                <div className="flex items-center justify-center my-6">
                  <span className="bg-muted text-muted-foreground text-xs font-semibold px-3 py-1 rounded-full border border-border/40">
                    {format(new Date(msg.createdAt), "MMMM d, yyyy")}
                  </span>
                </div>
              )}
              
              <div className={`group flex gap-4 ${isMine ? "flex-row-reverse" : ""}`}>
                <Avatar 
                  src={msg.sender.profile?.photo} 
                  alt={msg.sender.profile?.fullName || "User"} 
                  size="md" 
                  className="mt-1 flex-shrink-0" 
                />
                
                <div className={`flex flex-col max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
                  <div className={`flex items-baseline gap-2 mb-1 ${isMine ? "flex-row-reverse" : ""}`}>
                    <span className="font-semibold text-sm">{msg.sender.profile?.fullName}</span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </span>
                  </div>
                  
                  <div className="flex items-center relative gap-2">
                    {/* Hover Actions (Left if mine, Right if theirs) */}
                    {isMine && !msg.isDeleted && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex bg-card border border-border/60 rounded-md shadow-sm absolute -left-20 -top-4 z-10">
                        <button className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-l-md"><Smile className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-r-md"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                    
                    <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                      msg.isDeleted ? "bg-muted text-muted-foreground italic border border-border/40" :
                      isMine ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border/40 rounded-tl-sm"
                    }`}>
                      {msg.isDeleted ? (
                        "This message was deleted"
                      ) : (
                        <div className={`prose prose-sm max-w-none ${isMine ? "prose-invert" : "dark:prose-invert"}`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.message}
                          </ReactMarkdown>
                          
                          {/* Attachments rendering */}
                          {msg.attachmentUrl && (
                            <div className="mt-2 border border-border/40 rounded-lg overflow-hidden bg-background/50 inline-block">
                              {msg.type === "image" || msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                <img src={msg.attachmentUrl} alt="Attachment" className="max-w-[300px] max-h-[300px] object-cover" />
                              ) : (
                                <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors no-underline">
                                  <FileIcon className="w-5 h-5 text-primary" />
                                  <span className="text-sm font-medium">Attached File</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {msg.isEdited && !msg.isDeleted && (
                        <span className="text-[10px] opacity-70 ml-2">(edited)</span>
                      )}
                    </div>
                    
                    {!isMine && !msg.isDeleted && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex bg-card border border-border/60 rounded-md shadow-sm absolute -right-28 -top-4 z-10">
                        <button className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-l-md"><Smile className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground"><Reply className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-r-md"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                  
                  {/* Real Reactions Area */}
                  {msg.reactions && msg.reactions.length > 0 && !msg.isDeleted && (
                    <div className={`flex gap-1 mt-1 flex-wrap ${isMine ? "justify-end" : "justify-start"}`}>
                      {/* Group by emoji */}
                      {Object.entries(
                        msg.reactions.reduce((acc: any, r: any) => {
                          acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([emoji, count]) => (
                        <span key={emoji} className="inline-flex items-center gap-1 bg-muted/50 border border-border/40 text-[11px] px-2 py-0.5 rounded-full cursor-pointer hover:bg-muted">
                          {emoji} <span className="font-medium">{count as number}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="p-4 bg-background border-t border-border/40">
        <form onSubmit={handleSend} className="flex items-end gap-2 bg-card border border-border/60 rounded-xl p-2 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
          <div className="flex flex-col gap-2 p-1">
            <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          
          <textarea 
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message # Build a ZeroMeal..."
            className="flex-1 max-h-32 min-h-[40px] resize-none bg-transparent border-none focus:ring-0 p-2 text-[15px] custom-scrollbar leading-relaxed"
            rows={Math.min(5, newMessage.split('\n').length)}
          />
          
          <div className="flex items-center gap-2 p-1 pb-0.5">
            <button type="button" className="text-muted-foreground hover:text-foreground transition-colors p-1.5">
              <Smile className="w-5 h-5" />
            </button>
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || isSending} 
              size="sm"
              className="rounded-lg h-9 w-9 shrink-0 shadow-sm p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
        <div className="flex justify-between items-center mt-2 px-1">
          <p className="text-[10px] text-muted-foreground">
            <strong>Shift + Enter</strong> to add a new line
          </p>
          <p className="text-[10px] text-muted-foreground">
            Markdown is supported
          </p>
        </div>
      </div>
    </div>
  );
}
