import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, File, AlertCircle } from "lucide-react";
import { auth } from "@/lib/firebase/firebase";
import { ProjectFile } from "./FilesWorkspace";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

interface FileUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: (file: ProjectFile) => void;
}

const ALLOWED_MIME_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/zip": [".zip"],
  "application/x-rar-compressed": [".rar"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/svg+xml": [".svg"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
  "application/json": [".json"],
};

export function FileUploader({ isOpen, onClose, projectId, onSuccess }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    setIsUploading(true);
    setProgress(10); // Fake progress start

    try {
      const token = await auth.currentUser?.getIdToken();
      
      const formData = new FormData();
      formData.append("file", file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 300);

      const res = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      clearInterval(progressInterval);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      const uploadedFile = await res.json();
      setProgress(100);
      
      setTimeout(() => {
        onSuccess(uploadedFile);
        setIsUploading(false);
        setProgress(0);
      }, 500);
      
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
      setIsUploading(false);
      setProgress(0);
    }
  }, [projectId, onSuccess]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ALLOWED_MIME_TYPES,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === "file-too-large") {
        toast.error("File is larger than 10MB");
      } else if (error?.code === "file-invalid-type") {
        toast.error("File type not supported");
      } else {
        toast.error("Invalid file");
      }
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border/40">
          <h2 className="text-xl font-bold">Upload File</h2>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isUploading} className="h-8 w-8 p-0 rounded-full">
            <X className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        <div className="p-6">
          <div 
            {...getRootProps()} 
            className={`
              border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
              ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? "Drop file here" : "Click or drag file to this area"}
            </h3>
            
            <p className="text-sm text-muted-foreground max-w-xs">
              Supports PDF, DOCX, PPTX, XLSX, ZIP, RAR, PNG, JPG, SVG, TXT, MD, JSON (Max 10MB)
            </p>
          </div>

          {isUploading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Uploading...</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
