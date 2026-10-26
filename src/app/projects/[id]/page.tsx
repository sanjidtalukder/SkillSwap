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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <Header />
      <main className="container relative z-10 mx-auto max-w-5xl flex-1 space-y-8 p-6 md:p-10">
        
        {/* Navigation Breadcrumb / Back */}
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link href="/projects" className="hover:text-primary transition-colors flex items-center gap-1">
            ← Back to Project Board
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground truncate max-w-[200px]">{project.title}</span>
        </div>

        {/* Hero Header Section */}
        <div className="p-6 md:p-8 rounded-2xl border border-border/80 bg-card shadow-2xl shadow-black/40 backdrop-blur-md space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge 
              variant={project.status === "active" ? "success" : "secondary"}
              className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5"
            >
              {project.status}
            </Badge>
            <Badge variant="outline" className="text-[11px] border-slate-700 bg-slate-800/50 text-slate-300 px-2.5 py-0.5">
              {project.difficulty}
            </Badge>
            <Badge variant="secondary" className="text-[11px] bg-slate-800/70 border-slate-700/80 text-primary-300 px-2.5 py-0.5">
              <FolderOpen className="mr-1.5 h-3 w-3 inline text-primary" />
              {project.category}
            </Badge>
          </div>

          <h1 className="text-3xl font-extrabold md:text-5xl tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
            <div className="flex items-center gap-3">
              <Avatar src={project.ownerPhoto} alt={project.ownerName} size="md" className="ring-2 ring-primary/30" />
              <div className="text-sm">
                <p className="text-xs text-slate-400">Created by</p>
                <Link href={`/profile/${project.ownerId}`} className="font-semibold text-slate-200 hover:text-primary transition-colors">
                  {project.ownerName}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Posted {format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
              </div>
              {project.deadline && (
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Calendar className="h-4 w-4" />
                  <span>Ends {formatDistanceToNow(new Date(project.deadline))}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content & Sidebar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-start">
          
          <div className="md:col-span-2 space-y-8">
            <ProjectDescription description={project.description} />

            {isOwner && (
              <section className="space-y-4 p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl shadow-black/20 backdrop-blur-md">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Project Join Requests
                </h2>
                <ProjectJoinRequests projectId={project.id} />
              </section>
            )}

            {/* Required Skills Card */}
            <section className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl shadow-black/20 backdrop-blur-md space-y-4">
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Required Skills
              </h2>
              {project.requiredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map(skill => (
                    <Badge 
                      key={skill} 
                      variant="secondary" 
                      className="px-3 py-1 text-xs font-semibold bg-slate-800/80 border border-slate-700/80 text-slate-200 shadow-sm"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Not specified</p>
              )}
            </section>

            {/* Technologies Stack Card */}
            <section className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl shadow-black/20 backdrop-blur-md space-y-4">
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <Code className="h-5 w-5 text-cyan-400" />
                Technologies & Tools
              </h2>
              {project.technologies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <Badge 
                      key={tech} 
                      variant="outline" 
                      className="px-3 py-1 text-xs font-medium border-slate-700 bg-slate-950/60 text-slate-300"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Not specified</p>
              )}
            </section>

          </div>

          {/* Sticky Sidebar */}
          <div className="space-y-6 md:sticky top-24">
            
            {/* Quick Action Card */}
            <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 shadow-xl shadow-black/30 backdrop-blur-md space-y-5">
              
              <div className="flex flex-col gap-3">
                {isOwner ? (
                  <>
                    <Button className="w-full shadow-lg shadow-primary/25 font-semibold py-2.5" onClick={() => openWorkspace(project.id)} isLoading={isVerifying}>
                      Open Workspace
                    </Button>
                    <Link href={`/projects/${project.id}/edit`}>
                      <Button variant="secondary" className="w-full border border-slate-700/80 hover:bg-slate-800 font-medium">Edit Project</Button>
                    </Link>
                    <Button variant="destructive" className="w-full shadow-rose-950/50" onClick={handleDelete}>Delete Project</Button>
                  </>
                ) : isMember || project.joinRequestStatus === "accepted" ? (
                  <Button className="w-full shadow-lg shadow-primary/25 font-semibold py-2.5" onClick={() => openWorkspace(project.id)} isLoading={isVerifying}>
                    Open Workspace
                  </Button>
                ) : project.joinRequestStatus === "pending" ? (
                  <Button disabled variant="outline" className="w-full border-slate-700 text-slate-400">Request Sent</Button>
                ) : project.joinRequestStatus === "rejected" ? (
                  <Button 
                    onClick={handleJoinProject} 
                    isLoading={isJoining}
                    disabled={project.status !== "active"}
                    className="w-full shadow-lg shadow-primary/25 font-semibold py-2.5"
                  >
                    Request Workspace Access
                  </Button>
                ) : (
                  <Button 
                    onClick={handleJoinProject} 
                    isLoading={isJoining}
                    disabled={project.status !== "active"}
                    className="w-full shadow-lg shadow-primary/25 font-semibold py-2.5"
                  >
                    Join Workspace
                  </Button>
                )}
              </div>

              <div className="h-px bg-slate-800 w-full" />

              <h3 className="font-bold text-base tracking-tight text-white">Project Overview</h3>
              
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-primary" /> Category
                  </span>
                  <span className="font-semibold text-slate-200">{project.category}</span>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-400" /> Team Capacity
                  </span>
                  <span className="font-semibold text-slate-200">{project.members.length + 1} / {project.teamSize}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" /> Created
                  </span>
                  <span className="font-semibold text-slate-200">{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
                </div>

                {project.deadline && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-amber-400" /> Deadline
                    </span>
                    <span className="font-semibold text-amber-300">{format(new Date(project.deadline), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Team Members Card */}
            <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 shadow-xl shadow-black/30 backdrop-blur-md space-y-5">
              <h3 className="font-bold text-base tracking-tight text-white flex items-center justify-between">
                <span>Team Members</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                  {project.members.length + 1}
                </span>
              </h3>

              <div className="space-y-3.5">
                {/* Owner Item */}
                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
                  <Avatar src={project.ownerPhoto} alt={project.ownerName} size="md" className="ring-1 ring-primary/40" />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-semibold text-slate-200">{project.ownerName}</p>
                    <p className="text-xs text-slate-400 truncate">{project.ownerUniversity || "University"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-semibold bg-primary/20 text-primary-300 border-primary/30">Owner</Badge>
                      <Link href={`/u/${project.ownerUsername || project.ownerId}`} className="text-xs text-slate-400 hover:text-primary transition-colors">View Profile</Link>
                    </div>
                  </div>
                </div>
                
                {/* Members List */}
                {project.members.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/40 border border-slate-800/50">
                    <Avatar src={member.photo} alt={member.name} size="md" />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-semibold text-slate-200">{member.name}</p>
                      <p className="text-xs text-slate-400 truncate">{member.university || "University"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-slate-300 capitalize bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700/60">{member.role}</span>
                        <Link href={`/u/${member.username || member.userId}`} className="text-xs text-slate-400 hover:text-primary transition-colors">View Profile</Link>
                      </div>
                    </div>
                  </div>
                ))}
                
                {project.members.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-2">No other members yet.</p>
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
