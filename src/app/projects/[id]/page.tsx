"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api-client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProjectJoinRequests } from "@/features/projects/components/ProjectJoinRequests";
import { useWorkspaceAccess } from "@/hooks/useWorkspaceAccess";
import { ProjectDescription } from "@/features/projects/components/ProjectDescription";
import { Calendar, Users, FolderOpen, Code, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface ProjectMember {
  id: string;
  userId: string;
  role: string;
  name: string;
  photo: string;
}

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  technologies: string[];
  teamSize: number;
  difficulty: string;
  deadline: string | null;
  status: string;
  ownerId: string;
  ownerName: string;
  ownerPhoto: string;
  ownerUniversity?: string;
  ownerUsername?: string;
  joinRequestStatus?: "pending" | "accepted" | "rejected" | null;
  createdAt: string;
  members: ProjectMember[];
}

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { openWorkspace, isVerifying } = useWorkspaceAccess();
  
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetchWithAuth(`/api/projects/${id}`);
        if (!response.ok) throw new Error("Failed to load project details");
        const data = await response.json();
        setProject(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading project");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      void fetchProject();
    }
  }, [id]);

  const handleJoinProject = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    setIsJoining(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`/api/projects/${id}/requests`, {
        method: "POST"
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Failed to send join request");
      
      
      setProject((prev: any) => ({ ...prev, joinRequestStatus: "pending" }));
      toast.success("Workspace join request sent successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error requesting workspace access");
    } finally {
      setIsJoining(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      const response = await fetchWithAuth(`/api/projects/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete project");
      
      router.push("/projects");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error deleting project");
    }
  };

  if (isLoading || authLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="container mx-auto max-w-4xl flex-1 p-6 text-center pt-20">
          <Alert variant="error">{error || "Project not found"}</Alert>
          <Button className="mt-4" onClick={() => router.push("/projects")}>Back to Projects</Button>
        </main>
      </div>
    );
  }

  const isOwner = user?.uid === project.ownerId;
  const isMember = project.members.some(m => m.userId === user?.uid);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-4xl flex-1 space-y-8 p-6 md:p-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border/40">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={project.status === "active" ? "success" : "secondary"}>
                {project.status.toUpperCase()}
              </Badge>
              <Badge variant="outline">{project.difficulty}</Badge>
            </div>
            <h1 className="text-3xl font-bold md:text-5xl tracking-tight leading-tight">{project.title}</h1>
            <div className="flex items-center gap-3 pt-2">
              <Avatar src={project.ownerPhoto} alt={project.ownerName} size="md" />
              <div className="text-sm">
                <p className="text-muted-foreground">Created by</p>
                <Link href={`/profile/${project.ownerId}`} className="font-medium hover:underline">
                  {project.ownerName}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative items-start">
          
          <div className="md:col-span-2 space-y-10">
            <ProjectDescription description={project.description} />

            {isOwner && (
              <section className="space-y-4 pt-6 border-t border-border/40">
                <h2 className="text-xl font-semibold tracking-tight">Project Join Requests</h2>
                <ProjectJoinRequests projectId={project.id} />
              </section>
            )}

            <section className="space-y-4 pt-6 border-t border-border/40">
              <h2 className="text-xl font-semibold tracking-tight">Required Skills</h2>
              {project.requiredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map(skill => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm font-medium">{skill}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not specified</p>
              )}
            </section>

            <section className="space-y-4 pt-2">
              <h2 className="text-xl font-semibold tracking-tight">Technologies</h2>
              {project.technologies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <Badge key={tech} variant="outline" className="px-3 py-1 text-sm bg-background">
                      <Code className="mr-1.5 h-3.5 w-3.5 inline text-muted-foreground" />
                      {tech}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not specified</p>
              )}
            </section>

          </div>

          {/* Sidebar */}
          <div className="space-y-6 md:sticky top-24">
            
            <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm space-y-5">
              
              <div className="flex flex-col gap-3">
                {isOwner ? (
                  <>
                    <Button className="w-full" onClick={() => openWorkspace(project.id)} isLoading={isVerifying}>
                      Open Workspace
                    </Button>
                    <Link href={`/projects/${project.id}/edit`}>
                      <Button variant="secondary" className="w-full">Edit Project</Button>
                    </Link>
                    <Button variant="destructive" className="w-full" onClick={handleDelete}>Delete Project</Button>
                  </>
                ) : isMember || project.joinRequestStatus === "accepted" ? (
                  <Button className="w-full" onClick={() => openWorkspace(project.id)} isLoading={isVerifying}>
                    Open Workspace
                  </Button>
                ) : project.joinRequestStatus === "pending" ? (
                  <Button disabled variant="outline" className="w-full">Request Sent</Button>
                ) : project.joinRequestStatus === "rejected" ? (
                  <Button 
                    onClick={handleJoinProject} 
                    isLoading={isJoining}
                    disabled={project.status !== "active"}
                    className="w-full"
                  >
                    Request Workspace Access
                  </Button>
                ) : (
                  <Button 
                    onClick={handleJoinProject} 
                    isLoading={isJoining}
                    disabled={project.status !== "active"}
                    className="w-full"
                  >
                    Join Workspace
                  </Button>
                )}
              </div>

              <div className="h-px bg-border/40 w-full" />

              <h3 className="font-semibold text-lg tracking-tight">Project Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2"><FolderOpen className="h-4 w-4" /> Category</span>
                  <span className="font-medium">{project.category}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Team Size</span>
                  <span className="font-medium">{project.members.length + 1} / {project.teamSize}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Created</span>
                  <span className="font-medium">{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
                </div>

                {project.deadline && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-400" /> Deadline
                    </span>
                    <span className="font-medium">{format(new Date(project.deadline), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm space-y-5">
              <h3 className="font-semibold text-lg tracking-tight">Team Members</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar src={project.ownerPhoto} alt={project.ownerName} size="md" />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{project.ownerName}</p>
                    <p className="text-xs text-muted-foreground truncate">{project.ownerUniversity || "University"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Owner</Badge>
                      <Link href={`/u/${project.ownerUsername || project.ownerId}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">View Profile</Link>
                    </div>
                  </div>
                </div>
                
                {project.members.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar src={member.photo} alt={member.name} size="md" />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.university || "University"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-muted-foreground capitalize bg-muted/50 px-2 py-0.5 rounded-full">{member.role}</span>
                        <Link href={`/u/${member.username || member.userId}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">View Profile</Link>
                      </div>
                    </div>
                  </div>
                ))}
                
                {project.members.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-2">No other members yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
