import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Pin, MessageSquare, Paperclip, MoreVertical, Edit, Trash, Lock, FileText, Image as ImageIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface AnnouncementCardProps {
  announcement: any;
  isOwner: boolean;
  currentUserId: string;
  onEdit: (announcement: any) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onToggleReact: (id: string, emoji: string) => void;
  onCommentClick: (id: string) => void;
}

const EMOJIS = ["👍", "❤️", "🔥", "🎉", "👏"];

export function AnnouncementCard({
  announcement,
  isOwner,
  currentUserId,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleReact,
  onCommentClick
}: AnnouncementCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  // Group reactions by emoji
  const reactionsGrouped = EMOJIS.map(emoji => {
    const reacts = announcement.reactions?.filter((r: any) => r.emoji === emoji) || [];
    const hasReacted = reacts.some((r: any) => r.userId === currentUserId);
    return { emoji, count: reacts.length, hasReacted };
  }).filter(r => r.count > 0 || r.hasReacted); // Show if count > 0 or if user interacted with it (actually just show all available for clicking or only active ones?)
  
  const getFileIcon = (url: string) => {
    if (url.match(/\.(jpeg|jpg|gif|png)$/i)) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getFileName = (url: string) => {
    try {
      return decodeURIComponent(url.split("/").pop() || "Attachment");
    } catch {
      return "Attachment";
    }
  };

  return (
    <div className="bg-card border border-border/40 rounded-xl overflow-hidden transition-all hover:border-border/80">
      {/* Pinned Header */}
      {announcement.isPinned && (
        <div className="bg-primary/10 border-b border-primary/10 px-4 py-2 flex items-center gap-2 text-xs font-medium text-primary">
          <Pin className="w-3.5 h-3.5" />
          Pinned Announcement
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <Avatar 
              src={announcement.author?.profile?.photo} 
              alt={announcement.author?.profile?.fullName} 
            />
            <div>
              <h3 className="font-semibold text-lg text-foreground">{announcement.title}</h3>
              <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground/80">{announcement.author?.profile?.fullName}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <Badge variant={announcement.authorRole === "Owner" ? "success" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
                  {announcement.authorRole}
                </Badge>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          {isOwner && (
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-1 w-40 bg-card border border-border/40 rounded-md shadow-lg z-20 overflow-hidden py-1">
                    <button 
                      onClick={() => { setShowMenu(false); onTogglePin(announcement.id, !announcement.isPinned); }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 flex items-center gap-2"
                    >
                      <Pin className="w-4 h-4 text-muted-foreground" />
                      {announcement.isPinned ? "Unpin" : "Pin"}
                    </button>
                    <button 
                      onClick={() => { setShowMenu(false); onEdit(announcement); }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                      Edit
                    </button>
                    <button 
                      onClick={() => { setShowMenu(false); onDelete(announcement.id); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                    >
                      <Trash className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">
          {announcement.content}
        </div>

        {/* Attachments */}
        {announcement.attachments && announcement.attachments.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" /> Attachments ({announcement.attachments.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {announcement.attachments.map((url: string, index: number) => (
                <a 
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 hover:bg-muted/40 border border-border/40 rounded-md text-sm transition-colors"
                >
                  {getFileIcon(url)}
                  <span className="truncate max-w-[150px]">{getFileName(url)}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div className="flex items-center gap-1">
            {/* Display active reactions */}
            {reactionsGrouped.map((react, i) => (
              <button 
                key={i}
                onClick={() => onToggleReact(announcement.id, react.emoji)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  react.hasReacted ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/10 border-border/40 text-muted-foreground hover:bg-muted/30"
                }`}
              >
                <span>{react.emoji}</span>
                <span>{react.count}</span>
              </button>
            ))}
            
            {/* Add reaction menu */}
            <div className="relative group">
              <button className="flex items-center justify-center w-7 h-7 rounded-full bg-muted/10 border border-border/40 text-muted-foreground hover:bg-muted/30 transition-colors ml-1">
                +
              </button>
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:flex bg-card border border-border/40 rounded-full shadow-lg p-1 gap-1 z-10">
                {EMOJIS.map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => onToggleReact(announcement.id, emoji)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-muted/50 rounded-full text-lg transition-transform hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => onCommentClick(announcement.id)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted/20"
          >
            {announcement.commentsLocked ? (
              <><Lock className="w-4 h-4" /> Locked ({announcement._count?.comments || 0})</>
            ) : (
              <><MessageSquare className="w-4 h-4" /> Comments ({announcement._count?.comments || 0})</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
