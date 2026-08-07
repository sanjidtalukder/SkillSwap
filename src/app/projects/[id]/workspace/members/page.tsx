"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api-client";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import Link from "next/link";
import { Shield, UserMinus, LogOut } from "lucide-react";

export default function WorkspaceMembersPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWithAuth(`/api/projects/${id}`);
        const json = await res.json();
        if (!json.success) throw new Error("Failed to load members");
        setProject(json.data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) void loadData();
  }, [id]);

  const handleRemoveMember = async (userId: string, isSelf: boolean = false) => {
    if (!confirm(isSelf ? "Are you sure you want to leave this project?" : "Are you sure you want to remove this member?")) return;
    
    try {
      setIsProcessing(userId);
      const res = await fetchWithAuth(`/api/projects/${id}/members/${userId}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      toast.success(isSelf ? "You have left the project" : "Member removed");
      
      if (isSelf) {
        router.push("/dashboard");
      } else {
        window.location.reload();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error removing member");
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-4"><CardSkeleton count={3} /></div>;
  }

  if (!project) return null;

  const isOwner = project.ownerId === user?.uid;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-muted-foreground mt-1">Manage people in this workspace.</p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {project.members.length + 1} / {project.teamSize} Members
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Owner Card */}
        <div className="bg-card border-2 border-primary/20 rounded-xl p-5 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary" />
          <Avatar src={project.ownerPhoto} alt={project.ownerName} size="xl" className="mb-4 shadow-md" />
          <h3 className="font-semibold text-lg">{project.ownerName}</h3>
          <p className="text-xs text-muted-foreground mb-4">{project.ownerUniversity || "University"}</p>
          
          <Badge variant="success" className="mb-4">
            <Shield className="w-3 h-3 mr-1" /> Owner
          </Badge>
          
          <Link href={`/u/${project.ownerUsername || project.ownerId}`} className="mt-auto w-full">
            <Button variant="secondary" className="w-full text-xs h-8">View Profile</Button>
          </Link>
        </div>

        {/* Member Cards */}
        {project.members.map((member: any) => {
          const isSelf = member.userId === user?.uid;
          
          return (
            <div key={member.id} className="bg-card border border-border/40 rounded-xl p-5 flex flex-col items-center text-center transition-all hover:border-border">
              <Avatar src={member.photo} alt={member.name} size="xl" className="mb-4" />
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{member.university || "University"}</p>
              
              <Badge variant="outline" className="mb-4 capitalize">{member.role}</Badge>
              
              <div className="mt-auto w-full flex gap-2">
                <Link href={`/u/${member.username || member.userId}`} className="flex-1">
                  <Button variant="secondary" className="w-full text-xs h-8">Profile</Button>
                </Link>
                
                {isOwner && !isSelf && (
                  <Button 
                    variant="outline" 
                    className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
                    title="Remove Member"
                    onClick={() => handleRemoveMember(member.userId)}
                    isLoading={isProcessing === member.userId}
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                )}
                
                {isSelf && (
                  <Button 
                    variant="outline" 
                    className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
                    title="Leave Project"
                    onClick={() => handleRemoveMember(member.userId, true)}
                    isLoading={isProcessing === member.userId}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
