"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FilesTable } from "./FilesTable";
import { FilePreviewModal } from "./FilePreviewModal";
import { toast } from "sonner";
import { auth } from "@/lib/firebase/firebase";
import { Button } from "@/components/ui/Button";
import { Plus, FolderOpen } from "lucide-react";
import { FileUploader } from "./FileUploader";
import { FilesToolbar } from "./FilesToolbar";

export interface ProjectFile {
  id: string;
  projectId: string;
  uploaderId: string;
  originalName: string;
  storedName: string;
  url: string;
  size: number;
  mimeType: string;
  extension: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  uploader: {
    profile: {
      fullName: string;
      photo: string | null;
    } | null;
  };
}

interface FilesWorkspaceProps {
  projectId: string;
  isOwner: boolean;
  userId: string;
}

export function FilesWorkspace({ projectId, isOwner, userId }: FilesWorkspaceProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);

  const fetchFiles = useCallback(async (cursor?: string, reset = false) => {
    try {
      if (reset) setIsLoading(true);
      
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filter !== "all") params.append("filter", filter);
      params.append("sort", sort);
      if (cursor) params.append("cursor", cursor);

      const res = await fetch(`/api/projects/${projectId}/files?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to fetch files");

      const data = await res.json();
      
      if (reset) {
        setFiles(data.files);
      } else {
        setFiles(prev => [...prev, ...data.files]);
      }
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load files");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, search, filter, sort]);

  useEffect(() => {
    fetchFiles(undefined, true);
  }, [fetchFiles]);

  const handleUploadSuccess = (newFile: ProjectFile) => {
    setFiles(prev => [newFile, ...prev]);
    setIsUploaderOpen(false);
    toast.success("File uploaded successfully");
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/projects/${projectId}/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      
      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success("File deleted");
    } catch (err) {
      toast.error("Failed to delete file");
    }
  };

  const handleRename = async (fileId: string, newName: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/projects/${projectId}/files/${fileId}`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ originalName: newName })
      });
      if (!res.ok) throw new Error();
      
      const updated = await res.json();
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, originalName: updated.originalName } : f));
      toast.success("File renamed");
    } catch (err) {
      toast.error("Failed to rename file");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full flex flex-col h-full">
      <div className="flex items-start sm:items-center justify-between mb-8 flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 mb-2">
            <FolderOpen className="w-8 h-8 text-primary" />
            Files
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Shared workspace storage for your team.
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setIsUploaderOpen(true)} variant="primary" className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Upload File
          </Button>
        )}
      </div>

      <FilesToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
      />
      
      <div className="flex-1 overflow-auto bg-muted/5">
        <FilesTable 
          files={files} 
          isLoading={isLoading} 
          isOwner={isOwner}
          onPreview={setPreviewFile}
          onDelete={handleDelete}
          onRename={handleRename}
          hasMore={!!nextCursor}
          onLoadMore={() => fetchFiles(nextCursor!)}
          projectId={projectId}
          onUploadClick={() => setIsUploaderOpen(true)}
        />
      </div>

      <FileUploader 
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        projectId={projectId}
        onSuccess={handleUploadSuccess}
      />

      {previewFile && (
        <FilePreviewModal 
          file={previewFile} 
          onClose={() => setPreviewFile(null)} 
          projectId={projectId}
        />
      )}
    </div>
  );
}
