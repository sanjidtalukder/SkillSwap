"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useConnectionStatus } from "@/features/profiles/hooks/useConnectionStatus";
import { ExternalLink, MessageCircle, UserPlus, Clock, Check, X, MapPin, Briefcase, GraduationCap, Github, Linkedin, Globe, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth } from "@/lib/api-client";
import { UserProfile } from "@/features/profiles/types/profile";
import Link from "next/link";
import { ROUTES } from "@/constants";

export default function UserProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState<(UserProfile & { ownedProjects?: any[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/profile/by-username?username=${params.username}`);
        if (!res.ok) {
          throw new Error("Profile not found");
        }
        const data = await res.json();
        setProfile(data.profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [params.username]);

  const {
    status: connectionStatus,
    conversationId,
    sendRequest,
    acceptRequest,
    rejectRequest,
  } = useConnectionStatus(profile?.uid);

  const handleStartChat = async () => {
    if (!profile?.uid || startingChat) return;
    setStartingChat(true);
    try {
      const response = await fetchWithAuth("/api/chat/conversations", {
        method: "POST",
        body: JSON.stringify({ targetUserId: profile.uid })
      });
      const res = await response.json();
      if (res.success) {
        router.push(`/chat/${res.data.id}`);
      } else {
        alert(res.error || "Failed to start chat");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to start chat");
    } finally {
      setStartingChat(false);
    }
  };

  const isOwner = user?.uid === profile?.firebaseUID;

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto max-w-4xl flex-1 space-y-6 p-6 md:p-10">
          <EmptyState
            title="Profile Not Found"
            description="The profile you are looking for does not exist or has been removed."
            actionLabel="Go to Dashboard"
            onAction={() => router.push(ROUTES.DASHBOARD)}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-5xl flex-1 p-4 md:p-8 space-y-6">
        
        {/* Top Banner and Info Section */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {/* Banner */}
          <div 
            className="h-48 w-full bg-muted bg-cover bg-center"
            style={{ backgroundImage: profile.banner ? `url(${profile.banner})` : 'url(https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop)' }}
          />
          
          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="absolute -top-16 left-6 rounded-full border-4 border-card bg-card">
              <Avatar src={profile.photo || profile.avatarUrl} alt={profile.name} className="h-32 w-32" />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4 pb-2 h-14">
              {isOwner ? (
                <Button onClick={() => router.push("/complete-profile")} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  {connectionStatus === "LOADING" && (
                    <Button disabled>
                      <Spinner size="sm" className="mr-2" />
                      Loading
                    </Button>
                  )}
                  {connectionStatus === "NOT_CONNECTED" && (
                    <Button onClick={sendRequest} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                  {connectionStatus === "PENDING_SENT" && (
                    <Button disabled className="bg-yellow-500 text-white opacity-70">
                      <Clock className="w-4 h-4 mr-2" />
                      Pending
                    </Button>
                  )}
                  {connectionStatus === "PENDING_RECEIVED" && (
                    <>
                      <Button onClick={acceptRequest} className="bg-green-600 hover:bg-green-700 text-white">
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button onClick={rejectRequest} variant="destructive">
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {connectionStatus === "ACCEPTED" && conversationId && (
                    <Button onClick={() => router.push(`/chat/${conversationId}`)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Open Chat
                    </Button>
                  )}
                  {connectionStatus === "ACCEPTED" && !conversationId && (
                    <Button onClick={handleStartChat} disabled={startingChat}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {startingChat ? "Starting..." : "Message"}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="mt-4">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-muted-foreground text-sm font-medium">@{profile.username}</p>
              
              <p className="mt-3 text-sm max-w-2xl text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {profile.bio || "No bio provided."}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  <span>{profile.university} • {profile.department} {profile.semester ? `(${profile.semester})` : ""}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location || "Earth"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  <span>{profile.experience} • {profile.availability}</span>
                </div>
              </div>
              
              {/* Links */}
              <div className="mt-4 flex gap-3">
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-blue-500">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {profile.portfolio && (
                  <a href={profile.portfolio} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                    <Globe className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Skills I Have</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skillsHave.length > 0 ? (
                profile.skillsHave.map(skill => (
                  <Badge key={skill} variant="success" className="px-3 py-1">{skill}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No skills listed yet.</p>
              )}
            </div>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Skills I Want to Learn</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skillsNeed.length > 0 ? (
                profile.skillsNeed.map(skill => (
                  <Badge key={skill} variant="outline" className="px-3 py-1">{skill}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No skills listed yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Projects</h2>
            {isOwner && (
              <Button variant="ghost" size="sm" onClick={() => router.push("/projects/new")}>
                Create Project
              </Button>
            )}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {profile.ownedProjects && profile.ownedProjects.length > 0 ? (
              profile.ownedProjects.map(project => (
                <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                  <div className="border border-border/80 rounded-lg p-4 h-full transition-all hover:border-primary/50 hover:shadow-sm">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{project.title}</h3>
                      <Badge variant={project.status === "active" ? "primary" : "secondary"}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mt-4">
                      {project.technologies.slice(0, 3).map((tech: string) => (
                        <span key={tech} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{tech}</span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">+{project.technologies.length - 3}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-4 flex items-center justify-between">
                      <span>{project.members?.length || 1} members</span>
                      <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground col-span-2">No projects created yet.</p>
            )}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
