"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { ShieldAlert, Trash2 } from "lucide-react";

export default function WorkspaceSettingsPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    category: "",
    difficulty: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchWithAuth(`/api/projects/${id}`);
        const json = await res.json();
        if (!json.success) throw new Error("Failed to load project");
        
        if (json.data.ownerId !== user?.uid) {
          toast.error("Access denied");
          router.push(`/projects/${id}/workspace`);
          return;
        }

        setFormData({
          title: json.data.title || "",
          description: json.data.description || "",
          deadline: json.data.deadline ? new Date(json.data.deadline).toISOString().split('T')[0] : "",
          category: json.data.category || "",
          difficulty: json.data.difficulty || "",
        });
      } catch (err) {
        toast.error("Error loading project");
      } finally {
        setIsLoading(false);
      }
    };
    if (id && user) loadData();
  }, [id, user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetchWithAuth(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      toast.success("Project settings updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("WARNING: This will permanently delete the project and all its data. Are you absolutely sure?")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetchWithAuth(`/api/projects/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      toast.success("Project deleted");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error deleting project");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 max-w-2xl mx-auto animate-pulse bg-card h-96 rounded-xl" />;
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Project Settings</h1>
        <p className="text-muted-foreground mt-1">Manage project details and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-card border border-border/40 p-6 rounded-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Title</label>
            <input 
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              required
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input 
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.category}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deadline</label>
              <input 
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.deadline}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <Button type="submit" isLoading={isSaving} className="w-full">
          Save Changes
        </Button>
      </form>

      <div className="border border-red-500/20 bg-red-500/5 p-6 rounded-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-red-500 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Danger Zone
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Once you delete a project, there is no going back. Please be certain.</p>
          </div>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            isLoading={isDeleting}
            className="whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete Project
          </Button>
        </div>
      </div>
    </div>
  );
}
