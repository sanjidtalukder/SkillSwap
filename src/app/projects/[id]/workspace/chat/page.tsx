"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchWithAuth } from "@/lib/api-client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Send, Edit2, Trash2, Copy, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  message: string;
  senderId: string;
  createdAt: string;
  isEdited: boolean;
  isDeleted: boolean;
  sender: {
    id: string;
    firebaseUid: string;
    profile: {
      fullName: string;
      photo: string;
    }
  }
}

export default function WorkspaceChatPage() {
  const { id: projectId } = useParams() as { id: string };
  const { user } = useAuth();
  
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    async function initChat() {
      try {
        const res = await fetchWithAuth(`/api/projects/${projectId}`);
        const data = await res.json();
        if (data.success && data.data.conversationId) {
          setConversationId(data.data.conversationId);
        }
      } catch (error) {
        console.error("Failed to load project conversation", error);
      }
    }
    if (projectId) initChat();
  }, [projectId]);

  useEffect(() => {
    async function loadMessages() {
      if (!conversationId) return;
      try {
        const response = await fetchWithAuth(`/api/chat/conversations/${conversationId}/messages`);
        const data = await response.json();
        if (data.success) {
          setMessages(data.data);
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (user && conversationId) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000); // Polling
      return () => clearInterval(interval);
    }
  }, [conversationId, user]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending || !conversationId) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      if (editingId) {
        const response = await fetchWithAuth(`/api/chat/conversations/${conversationId}/messages/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify({ message: messageText })
        });
        const res = await response.json();
        
        if (res.success) {
          setMessages(prev => prev.map(m => m.id === editingId ? res.data : m));
          setEditingId(null);
        }
      } else {
        const response = await fetchWithAuth(`/api/chat/conversations/${conversationId}/messages`, {
          method: "POST",
          body: JSON.stringify({ message: messageText })
        });
        const res = await response.json();

        if (res.success) {
          setMessages(prev => [...prev, res.data]);
          setTimeout(scrollToBottom, 100);
        }
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!conversationId) return;
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    try {
      const response = await fetchWithAuth(`/api/chat/conversations/${conversationId}/messages/${messageId}`, {
        method: "DELETE"
      });
      const res = await response.json();
      
      if (res.success) {
        setMessages(prev => prev.map(m => m.id === messageId ? res.data : m));
      }
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const startEdit = (msg: Message) => {
    setEditingId(msg.id);
    setNewMessage(msg.message);
  };

  if (!conversationId && !loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <MessageSquare className="w-12 h-12 text-muted mb-4" />
        <h2 className="text-lg font-semibold">No Group Chat Available</h2>
        <p className="text-muted-foreground mt-2">This project does not have a group chat initialized yet.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border-l border-border/40">
      {/* Chat Header */}
      <div className="p-4 border-b border-border/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold">Project Group Chat</h2>
          <p className="text-xs text-muted-foreground">End-to-end team collaboration</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender.firebaseUid === user?.uid;
            
            return (
              <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isMine ? "ml-auto flex-row-reverse" : ""}`}>
                <Avatar src={msg.sender.profile?.photo} alt={msg.sender.profile?.fullName || ""} size="md" className="flex-shrink-0 mt-1 shadow-sm" />
                
                <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                  <div className="flex items-baseline gap-2 mb-1 mx-1">
                    <span className="text-sm font-semibold">{msg.sender.profile?.fullName}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(msg.createdAt), "h:mm a")}</span>
                  </div>
                  
                  <div className="flex items-center group relative">
                    {isMine && !msg.isDeleted && (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center mr-2 space-x-1">
                        <button onClick={() => handleCopy(msg.message)} title="Copy" className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => startEdit(msg)} title="Edit" className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(msg.id)} title="Delete" className="p-1.5 hover:bg-destructive/10 rounded text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                    
                    <div className={`px-4 py-2.5 rounded-2xl text-[15px] shadow-sm leading-relaxed ${
                      msg.isDeleted ? "bg-muted text-muted-foreground italic border border-border" :
                      isMine ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border/50 rounded-tl-sm"
                    }`}>
                      {msg.isDeleted ? "This message was deleted" : msg.message}
                      {msg.isEdited && !msg.isDeleted && (
                        <span className="text-[10px] opacity-70 ml-2 font-medium">(edited)</span>
                      )}
                    </div>

                    {!isMine && !msg.isDeleted && (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center ml-2 space-x-1">
                        <button onClick={() => handleCopy(msg.message)} title="Copy" className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border/40">
        {editingId && (
          <div className="flex items-center justify-between bg-muted/50 p-2 px-4 rounded-t-lg border border-b-0 border-border text-sm">
            <span className="font-medium text-primary">Editing message...</span>
            <Button variant="ghost" size="sm" className="h-6 hover:bg-muted-foreground/10" onClick={() => { setEditingId(null); setNewMessage(""); }}>Cancel</Button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input 
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message to the team..."
            className={`flex-1 flex h-12 w-full border border-border/60 bg-card px-4 py-2 text-[15px] shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all ${editingId ? 'rounded-tl-none rounded-tr-none rounded-b-xl' : 'rounded-xl'}`}
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sending} 
            className="h-12 w-12 rounded-xl flex-shrink-0 flex items-center justify-center p-0 shadow-sm"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
