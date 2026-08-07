"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProfileCard } from "@/features/profiles/components/ProfileCard";
import { ProjectRequestsSection } from "@/features/projects/components/ProjectRequestsSection";
import { useConnectionRequest } from "@/features/profiles/hooks/useConnectionRequest";
import { useCompletedProfiles } from "@/features/profiles/hooks/useCompletedProfiles";
import { useProfileRedirect } from "@/features/profiles/hooks/useProfileStatus";
import { fetchWithAuth } from "@/lib/api-client";
import { format } from "date-fns";
import { Activity, Briefcase, Users, Bell, Plus, Search, Edit, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants";
import { toast } from "sonner";
import { ConnectionDialog } from "@/components/common/ConnectionDialog";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [startingChatId, setStartingChatId] = useState<string | null>(null);
  const {
    isCheckingProfile,
    profileCompleted,
    error: profileError,
  } = useProfileRedirect(user, authLoading, { redirectWhenIncomplete: true });
  
  const { profiles, isLoading, error, reload } = useCompletedProfiles(
    Boolean(user) && !authLoading && profileCompleted === true
  );
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStatus, setDialogStatus] = useState<"not_connected" | "pending">("not_connected");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {
    pendingRecipientId,
    sendConnectionRequest,
  } = useConnectionRequest(user);

  const [activeTab, setActiveTab] = useState<"skills" | "projects" | "requests">("skills");
  const [projectData, setProjectData] = useState<any>(null);
  const [projectLoading, setProjectLoading] = useState(false);

  const [statsLoading, setStatsLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);

  const visibleProfiles = useMemo(
    () => (user ? profiles.filter((profile) => profile.uid !== user.uid) : profiles),
    [profiles, user]
  );

  useEffect(() => {
    if (user && profileCompleted) {
      setStatsLoading(true);
      fetchWithAuth("/api/dashboard/stats")
        .then(res => res.json())
        .then(data => {
          if (data.success) setStatsData(data.data);
        })
        .finally(() => setStatsLoading(false));
    }
  }, [user, profileCompleted]);

  useEffect(() => {
    if (activeTab === "projects" && user && !projectData) {
      setProjectLoading(true);
      fetchWithAuth("/api/projects/me")
        .then(res => res.json())
        .then(data => {
          if (data.success) setProjectData(data.data);
        })
        .finally(() => setProjectLoading(false));
    }
  }, [activeTab, user, projectData]);

  const handleStartChat = async (uid: string) => {
    if (startingChatId) return;
    setStartingChatId(uid);
    try {
      const response = await fetchWithAuth("/api/chat/conversations", {
        method: "POST",
        body: JSON.stringify({ targetUserId: uid })
      });
      const res = await response.json();
      if (res.success) {
        router.push(`/chat/${res.data.id}`);
      } else {
        if (res.connectionStatus === "not_connected" || res.connectionStatus === "pending") {
          setDialogStatus(res.connectionStatus);
          setSelectedUserId(uid);
          setDialogOpen(true);
        } else {
          toast.error(res.error || "Failed to start chat");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to start chat");
    } finally {
      setStartingChatId(null);
    }
  };

  const isBusy = authLoading || isCheckingProfile || profileCompleted !== true;

  if (isBusy) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto flex-1 p-6 md:p-10 flex items-center justify-center">
          <CardSkeleton count={1} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-6xl flex-1 space-y-8 p-6 md:p-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back. Here&apos;s what&apos;s happening with your connections and projects.
            </p>
          </div>
          
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/complete-profile")} className="hidden sm:flex">
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
            <Button variant="secondary" size="sm" onClick={() => router.push("/skills")}>
              <Search className="w-4 h-4 mr-2" /> Browse Skills
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push("/projects/new")}>
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            title="Total Skills" 
            value={statsData?.stats.totalSkills || 0} 
            icon={<CheckCircle className="w-5 h-5 text-green-500" />} 
            loading={statsLoading} 
          />
          <StatCard 
            title="Active Projects" 
            value={statsData?.stats.activeProjects || 0} 
            icon={<Briefcase className="w-5 h-5 text-blue-500" />} 
            loading={statsLoading} 
          />
          <StatCard 
            title="Connections" 
            value={statsData?.stats.connections || 0} 
            icon={<Users className="w-5 h-5 text-purple-500" />} 
            loading={statsLoading} 
          />
          <StatCard 
            title="Pending Requests" 
            value={statsData?.stats.pendingRequests || 0} 
            icon={<Clock className="w-5 h-5 text-yellow-500" />} 
            loading={statsLoading} 
          />
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Latest Notifications */}
          <div className="md:col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col max-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Bell className="w-4 h-4 mr-2 text-primary" /> Notifications
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {statsLoading ? (
                 <CardSkeleton count={1} />
              ) : statsData?.recentActivity.latestNotifications?.length > 0 ? (
                <>
                  {statsData.recentActivity.latestNotifications.slice(0, 3).map((notif: any) => (
                    <div key={notif.id} className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.body}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">{format(new Date(notif.createdAt), 'MMM d, h:mm a')}</p>
                    </div>
                  ))}
                  {statsData.recentActivity.latestNotifications.length > 3 && (
                    <div className="pt-2 text-center">
                      <Link href="/notifications" className="text-xs font-semibold text-primary hover:underline inline-flex items-center">
                        View All <ChevronRight className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Bell className="w-8 h-8 text-muted mb-2" />
                  <p className="text-sm text-muted-foreground">No new notifications</p>
                </div>
              )}
            </div>
          </div>

          {/* Latest Connections */}
          <div className="md:col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col">
            <h2 className="text-lg font-semibold flex items-center mb-4">
              <Users className="w-4 h-4 mr-2 text-primary" /> Recent Connections
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {statsLoading ? (
                 <CardSkeleton count={1} />
              ) : statsData?.recentActivity.latestConnections?.length > 0 ? (
                statsData.recentActivity.latestConnections.map((conn: any) => {
                  const otherUser = conn.senderId === user?.uid ? conn.receiver : conn.sender;
                  const profile = otherUser?.profile;
                  if (!profile) return null;
                  return (
                    <Link key={conn.id} href={`/u/${profile.username}`} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors group">
                      <Avatar src={profile.photo} alt={profile.fullName} className="w-10 h-10 border border-border/80" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{profile.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{profile.university}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  )
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Users className="w-8 h-8 text-muted mb-2" />
                  <p className="text-sm text-muted-foreground">No recent connections</p>
                </div>
              )}
            </div>
          </div>

          {/* Latest Projects */}
          <div className="md:col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col">
            <h2 className="text-lg font-semibold flex items-center mb-4">
              <Activity className="w-4 h-4 mr-2 text-primary" /> Discover Projects
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {statsLoading ? (
                 <CardSkeleton count={1} />
              ) : statsData?.recentActivity.latestProjects?.length > 0 ? (
                statsData.recentActivity.latestProjects.map((project: any) => (
                  <Link key={project.id} href={`/projects/${project.id}`} className="block p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors group">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{project.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <Avatar src={project.owner?.profile?.photo} alt="Owner" className="w-5 h-5" />
                        <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{project.owner?.profile?.fullName || "User"}</span>
                      </div>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {project._count.members + 1} / {project.teamSize}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Activity className="w-8 h-8 text-muted mb-2" />
                  <p className="text-sm text-muted-foreground">No new projects</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legacy Content: Tabs */}
        <div className="mt-12 space-y-6">
          <div className="flex space-x-2 border-b border-border/40 pb-px">
            <button
              onClick={() => setActiveTab("skills")}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === "skills" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              Skill Feed
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === "projects" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              My Projects
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === "requests" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              Project Requests
            </button>
          </div>

          {activeTab === "skills" && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <CardSkeleton count={6} />
                </div>
              ) : visibleProfiles.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleProfiles.map((profile) => (
                    <ProfileCard
                      key={profile.uid}
                      profile={profile}
                      onConnect={sendConnectionRequest}
                      onMessage={handleStartChat}
                      isConnecting={pendingRecipientId === profile.uid || startingChatId === profile.uid}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No completed profiles yet"
                  description="Completed student profiles will appear here as the SkillSwap community grows."
                  actionLabel="Refresh Feed"
                  onAction={reload}
                />
              )}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-12">
              {projectLoading ? (
                <CardSkeleton count={3} />
              ) : projectData ? (
                <>
                  <section>
                    <h2 className="text-xl font-bold mb-4">My Created Projects</h2>
                    {projectData.createdProjects.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {projectData.createdProjects.map((p: any) => (
                          <div key={p.id} className="p-5 border border-border/60 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <Link href={`/projects/${p.id}`} className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">{p.title}</Link>
                              <Badge variant={p.status === "active" ? "success" : "secondary"}>{p.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.description}</p>
                            <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border/40">
                              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Team: {p._count.members + 1} / {p.teamSize}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 border border-dashed rounded-xl text-center">
                        <p className="text-sm text-muted-foreground mb-4">You haven&apos;t created any projects yet.</p>
                        <Button variant="outline" size="sm" onClick={() => router.push("/projects/new")}>Create Your First Project</Button>
                      </div>
                    )}
                  </section>

                  <section>
                    <h2 className="text-xl font-bold mb-4">Projects I Joined</h2>
                    {projectData.joinedProjects.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {projectData.joinedProjects.map((p: any) => (
                          <div key={p.id} className="p-5 border border-border/60 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                            <Link href={`/projects/${p.id}`} className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1 mb-2 block">{p.title}</Link>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/40">
                              <Avatar src={p.owner?.profile?.photo} alt="Owner" className="w-6 h-6" />
                              <p className="text-xs text-muted-foreground">Owner: <span className="font-medium text-foreground">{p.owner.profile?.fullName || "User"}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 border border-dashed rounded-xl text-center">
                        <p className="text-sm text-muted-foreground">You haven&apos;t joined any projects yet.</p>
                      </div>
                    )}
                  </section>

                  <section>
                    <h2 className="text-xl font-bold mb-4">My Join Requests</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {projectData.pendingRequests.length > 0 && (
                        <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
                          <h3 className="font-semibold text-warning mb-4 flex items-center"><Clock className="w-4 h-4 mr-2" /> Pending</h3>
                          <ul className="space-y-3">
                            {projectData.pendingRequests.map((r: any) => (
                              <li key={r.id} className="text-sm bg-warning/10 p-3 rounded-lg border border-warning/20">
                                <span className="block text-warning-foreground font-medium mb-1">{r.project.title}</span>
                                <span className="text-xs text-warning-foreground/70">{format(new Date(r.createdAt), 'MMM d, yyyy')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {projectData.acceptedRequests.length > 0 && (
                        <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
                          <h3 className="font-semibold text-success mb-4 flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Accepted</h3>
                          <ul className="space-y-3">
                            {projectData.acceptedRequests.map((r: any) => (
                              <li key={r.id} className="text-sm bg-success/10 p-3 rounded-lg border border-success/20">
                                <span className="block text-success-foreground font-medium">{r.project.title}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {projectData.rejectedRequests.length > 0 && (
                        <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
                          <h3 className="font-semibold text-destructive mb-4 flex items-center"><Activity className="w-4 h-4 mr-2" /> Rejected</h3>
                          <ul className="space-y-3">
                            {projectData.rejectedRequests.map((r: any) => (
                              <li key={r.id} className="text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                                <span className="block text-destructive-foreground font-medium">{r.project.title}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {!projectData.pendingRequests.length && !projectData.acceptedRequests.length && !projectData.rejectedRequests.length && (
                         <div className="col-span-full p-6 border border-dashed rounded-xl text-center">
                           <p className="text-sm text-muted-foreground">No join requests.</p>
                         </div>
                      )}
                    </div>
                  </section>
                </>
              ) : null}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProjectRequestsSection />
            </div>
          )}
        </div>

      </main>
      
      {selectedUserId && (
        <ConnectionDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          status={dialogStatus}
          onSendRequest={async () => {
            await sendConnectionRequest(selectedUserId);
          }}
        />
      )}
      <Footer />
    </div>
  );
}

// Helper Component for Stat Cards
function StatCard({ title, value, icon, loading }: { title: string, value: number | string, icon: React.ReactNode, loading: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/40 group">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</h3>
        <div className="p-2 rounded-lg bg-background/50 border border-border/50">
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-muted animate-pulse rounded" />
      ) : (
        <p className="text-2xl font-bold text-foreground">{value}</p>
      )}
    </div>
  );
}
