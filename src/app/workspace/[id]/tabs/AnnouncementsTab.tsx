"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, BellRing } from "lucide-react";
import { fetchWithAuth } from "@/lib/api-client";
import { toast } from "sonner";
import { AnnouncementToolbar } from "@/features/projects/workspace/components/announcements/AnnouncementToolbar";
import { AnnouncementCard } from "@/features/projects/workspace/components/announcements/AnnouncementCard";
import { CreateAnnouncementModal } from "@/features/projects/workspace/components/announcements/CreateAnnouncementModal";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function AnnouncementsTab({ project, isOwner, user }: { project: any, isOwner: boolean, user: any }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("latest");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const fetchAnnouncements = useCallback(async (reset = false) => {
    try {
      if (reset) setIsLoading(true);
      const cursorParam = !reset && nextCursor ? `&cursor=${nextCursor}` : "";
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const filterParam = filter ? `&filter=${filter}` : "";
      
      const res = await fetchWithAuth(`/api/workspace/${project.id}/announcements?limit=10${cursorParam}${searchParam}${filterParam}`);
      if (!res.ok) throw new Error("Failed to load announcements");
      
      const data = await res.json();
      if (reset) {
        setAnnouncements(data.announcements);
      } else {
        setAnnouncements(prev => [...prev, ...data.announcements]);
      }
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [project.id, nextCursor, search, filter]);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnnouncements(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, filter]); // eslint-disable-line

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await fetchWithAuth(`/api/workspace/${project.id}/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Announcement deleted");
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      const res = await fetchWithAuth(`/api/workspace/${project.id}/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update pin status");
      }
      fetchAnnouncements(true);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleReact = async (id: string, emoji: string) => {
    try {
      // Optimistic update
      setAnnouncements(prev => prev.map(ann => {
        if (ann.id !== id) return ann;
        let newReactions = [...(ann.reactions || [])];
        const existingIdx = newReactions.findIndex((r: any) => r.userId === user.uid && r.emoji === emoji);
        if (existingIdx >= 0) {
          newReactions.splice(existingIdx, 1);
        } else {
          newReactions.push({ emoji, userId: user.uid, user: { profile: { fullName: user.profile?.fullName || "Me" } } });
        }
        return { ...ann, reactions: newReactions };
      }));

      const res = await fetchWithAuth(`/api/workspace/${project.id}/announcements/${id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji })
      });
      if (!res.ok) throw new Error("Failed to react");
    } catch (err: any) {
      toast.error(err.message);
      fetchAnnouncements(true); // revert
    }
  };

  const handleCommentClick = (id: string) => {
    // Navigate to a dedicated announcement page or open a side panel
    // For now, let's just alert since full comment thread UI requires a lot more space
    toast.info("Comments thread coming soon");
  };

  const handleEdit = (announcement: any) => {
    setEditData(announcement);
    setIsModalOpen(true);
  };

  const handleNewClick = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col h-full">
      <div className="flex items-start sm:items-center justify-between mb-8 flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 mb-2">
            <BellRing className="w-8 h-8 text-primary" />
            Announcements
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Official updates for this workspace.
          </p>
        </div>
        {isOwner && (
          <Button onClick={handleNewClick} variant="primary" className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            New Announcement
          </Button>
        )}
      </div>

      <AnnouncementToolbar 
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
      />

      <div className="flex-1 mt-6 overflow-y-auto custom-scrollbar pb-10 space-y-4">
        {isLoading && announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p>Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-border/40 border-dashed rounded-xl bg-card">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <BellRing className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No announcements yet</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Project owners can publish important project updates, meeting schedules, deadlines, and release notes.
            </p>
            {isOwner && (
              <Button onClick={handleNewClick} variant="primary">New Announcement</Button>
            )}
          </div>
        ) : (
          <>
            {announcements.map((ann) => (
              <AnnouncementCard 
                key={ann.id}
                announcement={ann}
                isOwner={isOwner}
                currentUserId={user.uid}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
                onToggleReact={handleToggleReact}
                onCommentClick={handleCommentClick}
              />
            ))}
            
            {nextCursor && (
              <div className="pt-6 pb-2 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => fetchAnnouncements()} 
                  disabled={isLoading}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <CreateAnnouncementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchAnnouncements(true)}
        projectId={project.id}
        editData={editData}
      />
    </div>
  );
}
