import React, { useEffect, useState } from "react";
import { X, Download, File as FileIcon, Loader2 } from "lucide-react";
import { ProjectFile } from "./FilesWorkspace";
import { Button } from "@/components/ui/Button";

interface FilePreviewModalProps {
  file: ProjectFile;
  onClose: () => void;
  projectId: string;
}

export function FilePreviewModal({ file, onClose, projectId }: FilePreviewModalProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const downloadUrl = `/api/projects/${projectId}/files/${file.id}/download`;

  const isImage = file.mimeType?.startsWith("image/");
  const isPdf = file.mimeType === "application/pdf";
  const isText = file.mimeType?.startsWith("text/") || ["json", "md", "js", "ts", "html", "css"].includes(file.extension);
  
  const canPreview = isImage || isPdf || isText;

  useEffect(() => {
    if (isText) {
      setIsLoading(true);
      fetch(downloadUrl)
        .then(res => res.text())
        .then(text => {
          setContent(text);
          setIsLoading(false);
        })
        .catch(() => {
          setError(true);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [file, isText, downloadUrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-200">
      <div className="bg-card w-full h-full max-h-full max-w-6xl rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border/40 bg-muted/10 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <h2 className="text-lg font-bold truncate" title={file.originalName}>
              {file.originalName}
            </h2>
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {formatSize(file.size)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href={downloadUrl} download>
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2 h-9">
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button variant="ghost" size="sm" className="sm:hidden h-9 w-9 p-0">
                <Download className="w-4 h-4" />
              </Button>
            </a>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0 rounded-full bg-muted/50 hover:bg-muted">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-background relative overflow-hidden flex items-center justify-center p-4">
          
          {!canPreview && (
            <div className="flex flex-col items-center justify-center text-center max-w-sm">
              <div className="w-24 h-24 bg-muted/30 rounded-2xl flex items-center justify-center mb-6">
                <FileIcon className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Preview Available</h3>
              <p className="text-muted-foreground mb-6">
                This file type cannot be previewed in the browser. Download it to view its contents.
              </p>
              <a href={downloadUrl} download>
                <Button variant="primary" size="lg" className="w-full">
                  <Download className="w-5 h-5 mr-2" />
                  Download File
                </Button>
              </a>
            </div>
          )}

          {canPreview && isLoading && (
            <div className="flex flex-col items-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              Loading preview...
            </div>
          )}

          {canPreview && error && (
            <div className="text-destructive font-medium">Failed to load preview.</div>
          )}

          {canPreview && !isLoading && !error && (
            <div className="w-full h-full flex items-center justify-center">
              {isImage && (
                <img 
                  src={downloadUrl} 
                  alt={file.originalName} 
                  className="max-w-full max-h-full object-contain rounded-lg" 
                />
              )}
              
              {isPdf && (
                <iframe 
                  src={`${downloadUrl}#toolbar=0`} 
                  className="w-full h-full border-0 rounded-lg bg-white"
                  title="PDF Preview"
                />
              )}
              
              {isText && content !== null && (
                <div className="w-full h-full bg-[#0d1117] rounded-lg overflow-auto p-6 text-left border border-border">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{content}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
