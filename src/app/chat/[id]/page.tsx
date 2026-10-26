"use client";

import { useEffect, useState, useRef, use } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchWithAuth } from "@/lib/api-client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Send, Edit2, Trash2, Copy } from "lucide-react";
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

export default function ChatWindow({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
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
    async function loadMessages() {
      try {
        const response = await fetchWithAuth(`/api/chat/conversations/${id}/messages`);
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
    
    if (user) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000); // Polling for new messages
      return () => clearInterval(interval);
    }
  }, [id, user]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      if (editingId) {
        // Edit existing message
        const response = await fetchWithAuth(`/api/chat/conversations/${id}/messages/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify({ message: messageText })
        });
        const res = await response.json();
        
        if (res.success) {
          setMessages(prev => prev.map(m => m.id === editingId ? res.data : m));
          setEditingId(null);
        }
      } else {
        // Send new message
        const response = await fetchWithAuth(`/api/chat/conversations/${id}/messages`, {
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
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    try {
      const response = await fetchWithAuth(`/api/chat/conversations/${id}/messages/${messageId}`, {
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

  const [conversationInfo, setConversationInfo] = useState<{ name: string; photo: string; isSelf: boolean } | null>(null);

  useEffect(() => {
    async function fetchConversationInfo() {
      try {
        const response = await fetchWithAuth("/api/chat/conversations");
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const current = data.data.find((c: any) => c.id === id);
          if (current) {
            setConversationInfo({
              name: current.otherUser.name,
              photo: current.otherUser.photo,
              isSelf: !!current.isSelf
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch conversation info", err);
      }
    }
    fetchConversationInfo();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      {conversationInfo && (
        <div className="px-6 py-3.5 border-b border-border/60 bg-card/60 backdrop-blur flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={conversationInfo.photo} alt={conversationInfo.name} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">{conversationInfo.name}</h2>
                {conversationInfo.isSelf && (
                  <span className="text-[10px] bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full border border-primary/20">
                    Self Note
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {conversationInfo.isSelf 
                  ? "Your personal space for ideas, notes and reminders" 
                  : "Direct Message"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && conversationInfo?.isSelf && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
              <Avatar src={conversationInfo.photo} alt="You" size="md" />
            </div>
            <h3 className="font-semibold text-foreground">Welcome to your personal space</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Use this chat to write down quick notes, reminders, draft messages, or save useful links!
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender.firebaseUid === user?.uid;
          
          return (
            <div key={msg.id} className={`flex gap-3 max-w-[80%] ${isMine ? "ml-auto flex-row-reverse" : ""}`}>
              <Avatar src={msg.sender.profile?.photo} alt={msg.sender.profile?.fullName || ""} size="sm" className="flex-shrink-0 mt-1" />
              
              <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                <div className="flex items-baseline gap-2 mb-1 mx-1">
                  <span className="text-sm font-semibold">{msg.sender.profile?.fullName}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(msg.createdAt), "h:mm a")}</span>
                </div>
                
                <div className="flex items-center group relative">
                  {isMine && !msg.isDeleted && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center mr-2 space-x-1">
                      <button onClick={() => handleCopy(msg.message)} title="Copy" className="p-1 hover:bg-muted rounded text-muted-foreground"><Copy className="w-3 h-3" /></button>
                      <button onClick={() => startEdit(msg)} title="Edit" className="p-1 hover:bg-muted rounded text-muted-foreground"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => handleDelete(msg.id)} title="Delete" className="p-1 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  )}
                  
                  <div className={`px-4 py-2 rounded-2xl ${
                    msg.isDeleted ? "bg-muted text-muted-foreground italic border border-border" :
                    isMine ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
                  }`}>
                    {msg.isDeleted ? "This message was deleted" : msg.message}
                    {msg.isEdited && !msg.isDeleted && (
                      <span className="text-[10px] opacity-70 ml-2">(edited)</span>
                    )}
                  </div>

                  {!isMine && !msg.isDeleted && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center ml-2 space-x-1">
                      <button onClick={() => handleCopy(msg.message)} title="Copy" className="p-1 hover:bg-muted rounded text-muted-foreground"><Copy className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-background border-t border-border">
        {editingId && (
          <div className="flex items-center justify-between bg-muted/50 p-2 px-4 rounded-t-lg border border-b-0 border-border text-sm">
            <span>Editing message...</span>
            <Button variant="ghost" size="sm" className="h-6" onClick={() => { setEditingId(null); setNewMessage(""); }}>Cancel</Button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className={`flex-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${editingId ? 'rounded-tl-none rounded-tr-none' : 'rounded-full'}`}
          />
          <Button type="submit" disabled={!newMessage.trim() || sending} className="rounded-full flex-shrink-0 px-3">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
