import React, { useState, useEffect } from "react";
import { X, UploadCloud, Pin, Lock, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchWithAuth } from "@/lib/api-client";

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  editData: any | null;
}

export function CreateAnnouncementModal({ isOpen, onClose, onSuccess, projectId, editData }: CreateAnnouncementModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [commentsLocked, setCommentsLocked] = useState(false);
  
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setTitle(editData.title || "");
        setContent(editData.content || "");
        setIsPinned(editData.isPinned || false);
        setCommentsLocked(editData.commentsLocked || false);
        setExistingAttachments(editData.attachments || []);
        setAttachments([]);
      } else {
        setTitle("");
        setContent("");
        setIsPinned(false);
        setCommentsLocked(false);
        setExistingAttachments([]);
        setAttachments([]);
      }
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter(file => file.size <= 10 * 1024 * 1024); // 10MB
      
      if (validFiles.length < filesArray.length) {
        toast.error("Some files were rejected (over 10MB limit)");
      }
      
      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    } else {
      setAttachments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload new attachments
      const uploadedUrls: string[] = [...existingAttachments];
      
      if (attachments.length > 0) {
        for (const file of attachments) {
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await fetchWithAuth(`/api/projects/${projectId}/files`, {
            method: "POST",
            body: formData,
            headers: {} // Let browser set multipart/form-data
          });
          
          if (!uploadRes.ok) throw new Error(`Failed to upload ${file.name}`);
          const uploadData = await uploadRes.json();
          uploadedUrls.push(uploadData.file.url);
        }
      }

      // 2. Create or update announcement
      const payload = {
        title: title.trim(),
        content: content.trim(),
        isPinned,
        commentsLocked,
        attachments: uploadedUrls
      };

      const url = editData 
        ? `/api/workspace/${projectId}/announcements/${editData.id}` 
        : `/api/workspace/${projectId}/announcements`;
        
      const method = editData ? "PATCH" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save announcement");
      }

      toast.success(editData ? "Announcement updated" : "Announcement published");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-2xl rounded-xl border border-border/40 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/40">
          <h2 className="text-xl font-bold">{editData ? "Edit Announcement" : "New Announcement"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="announcement-form" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sprint Planning Meeting"
                className="w-full bg-muted/20 border border-border/60 rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement here... (Supports basic formatting)"
                rows={8}
                className="w-full bg-muted/20 border border-border/60 rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-y min-h-[150px]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Attachments</label>
              
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-border/60 border-dashed rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-6 h-6 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                  </div>
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              {(existingAttachments.length > 0 || attachments.length > 0) && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {existingAttachments.map((url, i) => (
                    <div key={`ext-${i}`} className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 border border-border/40 rounded-md text-sm">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="truncate max-w-[120px]">{decodeURIComponent(url.split("/").pop() || "")}</span>
                      <button type="button" onClick={() => removeAttachment(i, true)} className="ml-1 text-muted-foreground hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {attachments.map((file, i) => (
                    <div key={`new-${i}`} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md text-sm">
                      {file.type.startsWith("image/") ? <ImageIcon className="w-3.5 h-3.5 text-primary" /> : <FileText className="w-3.5 h-3.5 text-primary" />}
                      <span className="truncate max-w-[120px] text-primary">{file.name}</span>
                      <button type="button" onClick={() => removeAttachment(i, false)} className="ml-1 text-primary hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-border/60 text-primary focus:ring-primary bg-muted/20"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                  <Pin className="w-4 h-4 text-muted-foreground group-hover:text-primary" /> Pin to top
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={commentsLocked}
                  onChange={(e) => setCommentsLocked(e.target.checked)}
                  className="rounded border-border/60 text-primary focus:ring-primary bg-muted/20"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-muted-foreground group-hover:text-primary" /> Lock comments
                </span>
              </label>
            </div>

          </form>
        </div>

        <div className="p-4 md:p-6 border-t border-border/40 bg-muted/10 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="announcement-form" variant="primary" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editData ? "Save Changes" : "Publish")}
          </Button>
        </div>
      </div>
    </div>
  );
}
