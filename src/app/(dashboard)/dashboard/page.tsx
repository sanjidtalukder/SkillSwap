"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
import { useConnectionRequest } from "@/features/profiles/hooks/useConnectionRequest";
import { useProfileRedirect } from "@/features/profiles/hooks/useProfileStatus";
import { fetchWithAuth } from "@/lib/api-client";
import { format } from "date-fns";
import { Activity, Briefcase, Users, Bell, Plus, Search, Edit, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants";
import { toast } from "sonner";
import { ConnectionDialog } from "@/components/common/ConnectionDialog";
import { Pagination } from "@/components/ui/Pagination";
import { useWorkspaceAccess } from "@/hooks/useWorkspaceAccess";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { openWorkspace, isVerifying } = useWorkspaceAccess();
  const [startingChatId, setStartingChatId] = useState<string | null>(null);
  
  const {
    isCheckingProfile,
    profileCompleted,
    error: profileError,
  } = useProfileRedirect(user, authLoading, { redirectWhenIncomplete: true });

  const [activeTab, setActiveTab] = useState<"skills" | "projects">(
    searchParams.get("tab") === "projects" ? "projects" : "skills"
  );

  // Pagination states from URL
  const skillPage = Math.max(1, parseInt(searchParams.get("skillPage") || "1", 10));
  const createdPage = Math.max(1, parseInt(searchParams.get("createdPage") || "1", 10));
  const joinedPage = Math.max(1, parseInt(searchParams.get("joinedPage") || "1", 10));
  const requestsPage = Math.max(1, parseInt(searchParams.get("requestsPage") || "1", 10));

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStatus, setDialogStatus] = useState<"not_connected" | "pending">("not_connected");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {
    pendingRecipientId,
    sendConnectionRequest,
  } = useConnectionRequest(user);

  const [statsLoading, setStatsLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);

  const [skillsData, setSkillsData] = useState<any>(null);
  const [skillsLoading, setSkillsLoading] = useState(true);

  const [projectData, setProjectData] = useState<any>(null);
  const [projectLoading, setProjectLoading] = useState(true);

  // Update URL helper
  const updateUrl = useCallback((paramsToUpdate: Record<string, string | number>) => {
    const query = new URLSearchParams(searchParams.toString());
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      query.set(key, value.toString());
    });
    router.push(`${pathname}?${query.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Handle Tab Change
  const handleTabChange = (tab: "skills" | "projects") => {
    setActiveTab(tab);
    updateUrl({ tab });
  };

  // Handle Page Change
  const handlePageChange = (type: "skill" | "created" | "joined" | "requests", newPage: number) => {
    updateUrl({ [`${type}Page`]: newPage });
    // Smooth scroll to tabs area roughly
    const tabsElement = document.getElementById("dashboard-tabs");
    if (tabsElement) {
      tabsElement.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 500, behavior: "smooth" }); 
    }
  };

  // Fetch Dashboard Stats
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

  // Fetch Skills
  const fetchSkills = useCallback(async () => {
    if (!user || profileCompleted !== true) return;
    setSkillsLoading(true);
    try {
      const res = await fetchWithAuth(`/api/skills?page=${skillPage}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setSkillsData(data.data);
      }
    } finally {
      setSkillsLoading(false);
    }
  }, [user, profileCompleted, skillPage]);

  useEffect(() => {
    if (!authLoading && activeTab === "skills") {
      void fetchSkills();
    }
  }, [authLoading, activeTab, fetchSkills]);

  const visibleProfiles = useMemo(
    () => (user && skillsData?.items ? skillsData.items.filter((profile: any) => profile.uid !== user.uid) : []),
    [skillsData, user]
  );

  // Fetch Projects
  const fetchProjects = useCallback(async () => {
    if (!user || profileCompleted !== true) return;
    setProjectLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("createdPage", createdPage.toString());
      query.set("joinedPage", joinedPage.toString());
      query.set("requestsPage", requestsPage.toString());
      
      const res = await fetchWithAuth(`/api/projects/me?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProjectData(data.data);
      }
    } finally {
      setProjectLoading(false);
    }
  }, [user, profileCompleted, createdPage, joinedPage, requestsPage]);

  useEffect(() => {
    if (!authLoading && activeTab === "projects") {
      void fetchProjects();
    }
  }, [authLoading, activeTab, fetchProjects]);

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
            <Button variant="outline" size="sm" onClick={() => router.push("/complete-profile?mode=edit")} className="hidden sm:flex">
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
          <div className="md:col-span-1 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-5 shadow-sm flex flex-col h-[420px] hover:border-primary/40 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
              <h2 className="text-lg font-semibold flex items-center tracking-tight">
                <Bell className="w-4 h-4 mr-2 text-primary" /> Notifications
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth custom-scrollbar">
              {statsLoading ? (
                 <CardSkeleton count={1} />
              ) : statsData?.recentActivity.latestNotifications?.length > 0 ? (
                <>
                  {statsData.recentActivity.latestNotifications.slice(0, 5).map((notif: any) => (
                    <div key={notif.id} className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.body}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">{format(new Date(notif.createdAt), 'MMM d, h:mm a')}</p>
                    </div>
                  ))}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Bell className="w-8 h-8 text-muted mb-2" />
                  <p className="text-sm text-muted-foreground">No new notifications</p>
                </div>
              )}
            </div>
            <div className="mt-auto pt-3 border-t border-border/40 text-center">
              <Link href="/notifications" className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors inline-flex items-center justify-center w-full py-1">
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>

          {/* Latest Connections */}
          <div className="md:col-span-1 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-5 shadow-sm flex flex-col h-[420px] hover:border-primary/40 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
              <h2 className="text-lg font-semibold flex items-center tracking-tight">
                <Users className="w-4 h-4 mr-2 text-primary" /> Recent Connections
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth custom-scrollbar">
              {statsLoading ? (
                 <CardSkeleton count={1} />
              ) : statsData?.recentActivity.latestConnections?.length > 0 ? (
                statsData.recentActivity.latestConnections.slice(0, 5).map((conn: any) => {
                  const otherUser = conn.senderId === user?.uid ? conn.receiver : conn.sender;
                  const profile = otherUser?.profile;
                  if (!profile) return null;
                  return (
                    <Link key={conn.id} href={`/u/${profile.username}`} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors group">
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
            <div className="mt-auto pt-3 border-t border-border/40 text-center">
              <button onClick={() => toast.info("View All Connections coming soon")} className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors inline-flex items-center justify-center w-full py-1">
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>

          {/* Latest Projects */}
          <div className="md:col-span-1 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-5 shadow-sm flex flex-col h-[420px] hover:border-primary/40 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
              <h2 className="text-lg font-semibold flex items-center tracking-tight">
                <Activity className="w-4 h-4 mr-2 text-primary" /> Discover Projects
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth custom-scrollbar">
              {statsLoading ? (
                 <CardSkeleton count={1} />
              ) : statsData?.recentActivity.latestProjects?.length > 0 ? (
                statsData.recentActivity.latestProjects.slice(0, 5).map((project: any) => (
                  <Link key={project.id} href={`/projects/${project.id}`} className="block p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors group">
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
            <div className="mt-auto pt-3 border-t border-border/40 text-center">
              <Link href="/projects" className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors inline-flex items-center justify-center w-full py-1">
                Browse More <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Content: Tabs */}
        <div id="dashboard-tabs" className="mt-12 space-y-6 scroll-mt-24">
          <div className="flex space-x-2 border-b border-border/40 pb-px">
            <button
              onClick={() => handleTabChange("skills")}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === "skills" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              Skill Feed
            </button>
            <button
              onClick={() => handleTabChange("projects")}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === "projects" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              My Projects
            </button>
          </div>

          {activeTab === "skills" && (
            <div className="space-y-6">
              {skillsLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <CardSkeleton count={10} />
                </div>
              ) : visibleProfiles.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleProfiles.map((profile: any) => (
                      <ProfileCard
                        key={profile.uid}
                        profile={profile}
                        onConnect={sendConnectionRequest}
                        onMessage={handleStartChat}
                        isConnecting={pendingRecipientId === profile.uid || startingChatId === profile.uid}
                      />
                    ))}
                  </div>
                  {skillsData?.totalPages > 1 && (
                    <Pagination
                      currentPage={skillsData.currentPage}
                      totalPages={skillsData.totalPages}
                      onPageChange={(page) => handlePageChange("skill", page)}
                    />
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No completed profiles yet"
                  description="Completed student profiles will appear here as the SkillSwap community grows."
                  actionLabel="Refresh Feed"
                  onAction={() => fetchSkills()}
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
                    <h2 className="text-xl font-bold mb-4">Projects Created By Me</h2>
                    {projectData.createdProjects.items.length > 0 ? (
                      <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {projectData.createdProjects.items.map((p: any) => (
                            <div key={p.id} className="flex flex-col p-5 border border-border/60 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <Link href={`/projects/${p.id}`} className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">{p.title}</Link>
                                <Badge variant={p.status === "active" ? "success" : "secondary"}>{p.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.description}</p>
                              <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border/40 mb-4">
                                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Team: {p._count.members + 1} / {p.teamSize}</span>
                                {p._count.joinRequests > 0 && (
                                  <Badge variant="warning" className="px-2 py-0 animate-pulse text-[10px]">
                                    Pending Requests: {p._count.joinRequests}
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${p.id}/edit`)} className="w-full text-xs">Edit Project</Button>
                                <Button variant="primary" size="sm" onClick={() => openWorkspace(p.id)} isLoading={isVerifying} className="w-full text-xs">Open Workspace</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {projectData.createdProjects.totalPages > 1 && (
                          <Pagination
                            currentPage={projectData.createdProjects.currentPage}
                            totalPages={projectData.createdProjects.totalPages}
                            onPageChange={(page) => handlePageChange("created", page)}
                          />
                        )}
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
                    {projectData.joinedProjects.items.length > 0 ? (
                      <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {projectData.joinedProjects.items.map((p: any) => (
                            <div key={p.id} className="flex flex-col p-5 border border-border/60 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                              <Link href={`/projects/${p.id}`} className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1 mb-2 block">{p.title}</Link>
                              <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border/40 mb-4">
                                <div className="flex items-center gap-2">
                                  <Avatar src={p.owner?.profile?.photo} alt="Owner" className="w-6 h-6" />
                                  <span><span className="font-medium text-foreground">{p.owner?.profile?.fullName || "User"}</span></span>
                                </div>
                                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {p._count?.members ? p._count.members + 1 : 1} / {p.teamSize}</span>
                              </div>
                              <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
                                <Button variant="primary" size="sm" onClick={() => openWorkspace(p.id)} isLoading={isVerifying} className="w-full text-xs">Open Workspace</Button>
                                <Button variant="outline" size="sm" onClick={() => toast.error("Leave Project coming soon")} className="w-full text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground">Leave Project</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {projectData.joinedProjects.totalPages > 1 && (
                          <Pagination
                            currentPage={projectData.joinedProjects.currentPage}
                            totalPages={projectData.joinedProjects.totalPages}
                            onPageChange={(page) => handlePageChange("joined", page)}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="p-6 border border-dashed rounded-xl text-center">
                        <p className="text-sm text-muted-foreground">You haven&apos;t joined any projects yet.</p>
                        <Button variant="outline" size="sm" onClick={() => router.push("/projects")}>Explore Projects</Button>
                      </div>
                    )}
                  </section>

                  <section>
                    <h2 className="text-xl font-bold mb-4">Pending Join Requests</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {projectData.pendingRequests.items.length > 0 ? (
                        <div className="space-y-6 col-span-full">
                          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {projectData.pendingRequests.items.map((r: any) => (
                              <div key={r.id} className="flex flex-col bg-card border border-border/60 rounded-xl p-5 shadow-sm">
                                <div className="flex items-start justify-between mb-2">
                                  <span className="block text-foreground font-semibold line-clamp-1">{r.project.title}</span>
                                  <Badge variant="warning" className="text-[10px]">Pending</Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <p className="text-xs text-muted-foreground">Owner: <span className="font-medium text-foreground">{r.project.owner?.profile?.fullName || "Unknown"}</span></p>
                                </div>
                                <span className="text-xs text-muted-foreground mt-2 block mb-4">Requested: {format(new Date(r.createdAt), 'MMM d, yyyy')}</span>
                                
                                <div className="mt-auto pt-4 border-t border-border/40">
                                  <Button variant="outline" size="sm" onClick={() => toast.error("Cancel Request coming soon")} className="w-full text-xs">Cancel Request</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          {projectData.pendingRequests.totalPages > 1 && (
                            <Pagination
                              currentPage={projectData.pendingRequests.currentPage}
                              totalPages={projectData.pendingRequests.totalPages}
                              onPageChange={(page) => handlePageChange("requests", page)}
                            />
                          )}
                        </div>
                      ) : (
                         <div className="col-span-full p-6 border border-dashed rounded-xl text-center">
                           <p className="text-sm text-muted-foreground">No pending join requests.</p>
                         </div>
                      )}
                    </div>
                  </section>
                </>
              ) : null}
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

