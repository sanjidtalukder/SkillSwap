import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ProjectFile } from "./FilesWorkspace";
import { 
  File, FileText, FileImage, FileArchive, FileCode, FileType2, 
  MoreVertical, Download, Eye, Edit2, Trash2, Link as LinkIcon 
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

interface FilesTableProps {
  files: ProjectFile[];
  isLoading: boolean;
  isOwner: boolean;
  onPreview: (file: ProjectFile) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  projectId: string;
}

export function FilesTable({ 
  files, isLoading, isOwner, onPreview, onDelete, onRename, hasMore, onLoadMore, projectId, onUploadClick 
}: FilesTableProps & { onUploadClick?: () => void }) {

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string, extension: string) => {
    if (mimeType.startsWith("image/")) return <FileImage className="w-5 h-5 text-blue-400" />;
    if (mimeType === "application/pdf") return <FileType2 className="w-5 h-5 text-red-400" />;
    if (["zip", "rar"].includes(extension)) return <FileArchive className="w-5 h-5 text-amber-400" />;
    if (["json", "js", "ts", "html", "css"].includes(extension)) return <FileCode className="w-5 h-5 text-green-400" />;
    if (["txt", "md"].includes(extension)) return <FileText className="w-5 h-5 text-slate-400" />;
    return <File className="w-5 h-5 text-muted-foreground" />;
  };

  const handleCopyLink = (file: ProjectFile) => {
    const url = `${window.location.origin}/api/projects/${projectId}/files/${file.id}/download`;
    navigator.clipboard.writeText(url);
    toast.success("Download link copied to clipboard");
    setOpenDropdown(null);
  };

  const submitRename = (file: ProjectFile) => {
    if (renameValue.trim() && renameValue !== file.originalName) {
      onRename(file.id, renameValue.trim());
    }
    setRenamingId(null);
  };

  if (isLoading && files.length === 0) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-12 bg-muted/20 animate-pulse rounded-lg border border-border/20" />
        ))}
      </div>
    );
  }

  if (!isLoading && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-border/40 border-dashed rounded-xl bg-card m-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <File className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">No files uploaded yet</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Project owners can upload documents, datasets, source code, design files, and reports for the team.
        </p>
        {isOwner && onUploadClick && (
          <Button onClick={onUploadClick} variant="primary">
            Upload File
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-background/50 sticky top-0 z-10 backdrop-blur-md">
            <th className="px-6 py-4 font-medium">Name</th>
            <th className="px-6 py-4 font-medium hidden md:table-cell">Size</th>
            <th className="px-6 py-4 font-medium hidden sm:table-cell">Uploaded By</th>
            <th className="px-6 py-4 font-medium hidden lg:table-cell">Date</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {files.map(file => (
            <tr key={file.id} className="hover:bg-muted/30 transition-colors group">
              <td className="px-6 py-4 flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border border-border/40 shadow-sm shrink-0">
                  {getFileIcon(file.mimeType, file.extension)}
                </div>
                {renamingId === file.id ? (
                  <input 
                    autoFocus
                    type="text"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => submitRename(file)}
                    onKeyDown={e => e.key === "Enter" && submitRename(file)}
                    className="flex-1 bg-background border border-primary px-2 py-1 rounded text-sm outline-none"
                  />
                ) : (
                  <div className="flex flex-col min-w-0">
                    <span 
                      className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={() => onPreview(file)}
                    >
                      {file.originalName}
                    </span>
                    <span className="text-xs text-muted-foreground md:hidden">{formatSize(file.size)}</span>
                  </div>
                )}
              </td>
              
              <td className="px-6 py-4 hidden md:table-cell">
                <span className="text-sm text-muted-foreground">{formatSize(file.size)}</span>
              </td>
              
              <td className="px-6 py-4 hidden sm:table-cell">
                <div className="flex items-center gap-2">
                  <Avatar src={file.uploader.profile?.photo || ""} alt={file.uploader.profile?.fullName || "Unknown"} size="sm" />
                  <span className="text-sm truncate max-w-[120px]">{file.uploader.profile?.fullName || "Unknown"}</span>
                </div>
              </td>
              
              <td className="px-6 py-4 hidden lg:table-cell">
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                </span>
              </td>
              
              <td className="px-6 py-4 text-right relative">
                <div className="flex items-center justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onPreview(file)}
                    className="hidden sm:flex h-8 px-2 text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <a 
                    href={`/api/projects/${projectId}/files/${file.id}/download`}
                    download
                    className="hidden sm:flex h-8 px-2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setOpenDropdown(openDropdown === file.id ? null : file.id)}
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                    
                    {openDropdown === file.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border/60 rounded-md shadow-xl z-50 py-1 text-sm">
                        <button className="w-full text-left px-4 py-2 hover:bg-muted flex items-center sm:hidden" onClick={() => { onPreview(file); setOpenDropdown(null); }}>
                          <Eye className="w-4 h-4 mr-2" /> Preview
                        </button>
                        <a href={`/api/projects/${projectId}/files/${file.id}/download`} className="w-full text-left px-4 py-2 hover:bg-muted flex items-center sm:hidden" onClick={() => setOpenDropdown(null)}>
                          <Download className="w-4 h-4 mr-2" /> Download
                        </a>
                        <button className="w-full text-left px-4 py-2 hover:bg-muted flex items-center" onClick={() => handleCopyLink(file)}>
                          <LinkIcon className="w-4 h-4 mr-2" /> Copy Link
                        </button>
                        {isOwner && (
                          <>
                            <div className="h-px bg-border/40 my-1" />
                            <button className="w-full text-left px-4 py-2 hover:bg-muted flex items-center" onClick={() => { setRenameValue(file.originalName); setRenamingId(file.id); setOpenDropdown(null); }}>
                              <Edit2 className="w-4 h-4 mr-2" /> Rename
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-destructive/10 text-destructive flex items-center" onClick={() => { onDelete(file.id); setOpenDropdown(null); }}>
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {hasMore && (
        <div className="p-4 flex justify-center border-t border-border/20">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
