"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProfileCard } from "@/features/profiles/components/ProfileCard";
import { useConnectionRequest } from "@/features/profiles/hooks/useConnectionRequest";
import { useCompletedProfiles } from "@/features/profiles/hooks/useCompletedProfiles";
import { useProfileRedirect } from "@/features/profiles/hooks/useProfileStatus";
import { fetchWithAuth } from "@/lib/api-client";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    isCheckingProfile,
    profileCompleted,
    error: profileError,
  } = useProfileRedirect(user, authLoading, { redirectWhenIncomplete: true });
  const { profiles, isLoading, error, reload } = useCompletedProfiles(
    Boolean(user) && !authLoading && profileCompleted === true
  );
  const {
    notice: connectNotice,
    error: connectError,
    pendingRecipientId,
    sendConnectionRequest,
  } = useConnectionRequest(user);

  const [activeTab, setActiveTab] = useState<"skills" | "projects">("skills");
  const [projectData, setProjectData] = useState<any>(null);
  const [projectLoading, setProjectLoading] = useState(false);

  const visibleProfiles = useMemo(
    () => (user ? profiles.filter((profile) => profile.uid !== user.uid) : profiles),
    [profiles, user]
  );

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

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-6xl flex-1 space-y-8 p-6 md:p-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Dashboard
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Manage your skill connections and project collaborations.
          </p>
        </div>

        <div className="flex space-x-2 border-b border-border/40 pb-px">
          <button
            onClick={() => setActiveTab("skills")}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === "skills" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            Skill Feed
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === "projects" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            My Projects
          </button>
        </div>

        {(profileError || error || connectError) && (
          <Alert variant="error">{profileError || error || connectError}</Alert>
        )}
        {connectNotice && <Alert variant="success">{connectNotice}</Alert>}

        {activeTab === "skills" && (
          <div className="space-y-6">
            {authLoading || isCheckingProfile || profileCompleted !== true || isLoading ? (
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
                    isConnecting={pendingRecipientId === profile.uid}
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
                  <h2 className="text-2xl font-bold mb-4">My Created Projects</h2>
                  {projectData.createdProjects.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {projectData.createdProjects.map((p: any) => (
                        <div key={p.id} className="p-4 border rounded-lg bg-card">
                          <div className="flex justify-between items-start">
                            <Link href={`/projects/${p.id}`} className="font-semibold text-lg hover:underline">{p.title}</Link>
                            <Badge variant={p.status === "active" ? "success" : "secondary"}>{p.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
                          <div className="mt-4 text-xs text-muted-foreground">Team: {p._count.members + 1} / {p.teamSize}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">You haven&apos;t created any projects yet.</p>
                  )}
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">Projects I Joined</h2>
                  {projectData.joinedProjects.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {projectData.joinedProjects.map((p: any) => (
                        <div key={p.id} className="p-4 border rounded-lg bg-card">
                          <Link href={`/projects/${p.id}`} className="font-semibold text-lg hover:underline">{p.title}</Link>
                          <p className="text-sm text-muted-foreground mt-2">Owner: {p.owner.profile?.fullName}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">You haven&apos;t joined any projects yet.</p>
                  )}
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">My Join Requests</h2>
                  <div className="space-y-4">
                    {projectData.pendingRequests.length > 0 && (
                      <div>
                        <h3 className="font-medium text-warning mb-2">Pending</h3>
                        <ul className="space-y-2">
                          {projectData.pendingRequests.map((r: any) => (
                            <li key={r.id} className="text-sm bg-muted/20 p-2 rounded flex justify-between">
                              <span>Requested to join: <b>{r.project.title}</b></span>
                              <span className="text-muted-foreground">{format(new Date(r.createdAt), 'MMM d')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {projectData.acceptedRequests.length > 0 && (
                      <div>
                        <h3 className="font-medium text-success mb-2">Accepted</h3>
                        <ul className="space-y-2">
                          {projectData.acceptedRequests.map((r: any) => (
                            <li key={r.id} className="text-sm bg-success/10 p-2 rounded flex justify-between">
                              <span>Accepted into: <b>{r.project.title}</b></span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {projectData.rejectedRequests.length > 0 && (
                      <div>
                        <h3 className="font-medium text-destructive mb-2">Rejected</h3>
                        <ul className="space-y-2">
                          {projectData.rejectedRequests.map((r: any) => (
                            <li key={r.id} className="text-sm bg-destructive/10 p-2 rounded flex justify-between">
                              <span>Rejected from: <b>{r.project.title}</b></span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {!projectData.pendingRequests.length && !projectData.acceptedRequests.length && !projectData.rejectedRequests.length && (
                       <p className="text-sm text-muted-foreground">No join requests.</p>
                    )}
                  </div>
                </section>
              </>
            ) : null}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
