"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchWithAuth } from "@/lib/api-client";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  CheckSquare, 
  FileBox, 
  BellRing, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// Import modules (we'll build these next)
import { OverviewTab } from "./tabs/OverviewTab";
import { DiscussionTab } from "./tabs/DiscussionTab";
import { MembersTab } from "./tabs/MembersTab";
import { TasksTab } from "./tabs/TasksTab";
import { FilesTab } from "./tabs/FilesTab";
import { AnnouncementsTab } from "./tabs/AnnouncementsTab";
import { SettingsTab } from "./tabs/SettingsTab";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "discussion", label: "Discussion", icon: MessageSquare },
  { id: "members", label: "Members", icon: Users },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "files", label: "Files", icon: FileBox },
  { id: "announcements", label: "Announcements", icon: BellRing },
];

export default function WorkspacePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [project, setProject] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchWorkspace = async () => {
      try {
        const response = await fetchWithAuth(`/api/workspace/${id}`);
        if (!response.ok) {
          throw new Error("Access Denied");
        }
        const data = await response.json();
        setProject(data.data.project);
        setIsMember(true);
        setIsOwner(data.data.project.ownerId === user.uid);
      } catch (err) {
        // Redirect to projects details if they can't access
        router.push(`/projects/${id}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspace();
  }, [id, user, authLoading, router]);

  if (isLoading || authLoading) {
    return <div className="flex h-screen items-center justify-center bg-background text-foreground">Loading Workspace...</div>;
  }

  if (!project || !isMember) {
    return null; // Redirect handles this
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab project={project} setActiveTab={setActiveTab} />;
      case "discussion": return <DiscussionTab project={project} user={user} />;
      case "members": return <MembersTab project={project} isOwner={isOwner} user={user} />;
      case "tasks": return <TasksTab project={project} user={user} />;
      case "files": return <FilesTab project={project} user={user} />;
      case "announcements": return <AnnouncementsTab project={project} isOwner={isOwner} user={user} />;
      case "settings": return isOwner ? <SettingsTab project={project} /> : null;
      default: return <OverviewTab project={project} setActiveTab={setActiveTab} />;
    }
  };

  const allTabs = isOwner 
    ? [...TABS, { id: "settings", label: "Settings", icon: Settings }] 
    : TABS;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/40 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-4 flex items-center justify-between border-b border-border/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold">
              {project.title.charAt(0)}
            </div>
            <span className="font-bold truncate">{project.title}</span>
          </div>
          <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {allTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-4 border-t border-border/40">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => router.push("/dashboard?tab=projects")}>
            <LogOut className="w-4 h-4 mr-2" />
            Exit Workspace
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
        {/* Top Navbar for Mobile */}
        <header className="h-14 border-b border-border/40 flex items-center px-4 md:hidden flex-shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="mr-3 text-muted-foreground hover:text-foreground">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold truncate">{project.title}</span>
        </header>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex">
          <div className="flex-1 flex flex-col min-w-0">
            {renderTabContent()}
          </div>
          
          {/* Right Sidebar (Only shown on discussion tab) */}
          {activeTab === "discussion" && (
            <aside className="hidden lg:flex w-72 border-l border-border/40 bg-card flex-col overflow-y-auto custom-scrollbar">
              <div className="p-4 border-b border-border/40 bg-muted/20">
                <h3 className="font-semibold text-sm">Group Info</h3>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold mb-3 text-xs text-muted-foreground uppercase tracking-wider">Project Members — {project.members.length + 1}</h3>
                <div className="space-y-3 mb-6">
                  {/* Owner */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar src={project.owner?.profile?.photo} alt={project.owner?.profile?.fullName} size="sm" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></span>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{project.owner?.profile?.fullName}</p>
                      <Badge variant="success" className="text-[9px] px-1.5 py-0 h-4">Owner</Badge>
                    </div>
                  </div>
                  
                  {/* Other members */}
                  {project.members.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <div className="relative">
                        <Avatar src={m.user?.profile?.photo} alt={m.user?.profile?.fullName} size="sm" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.user?.profile?.fullName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <h3 className="font-semibold mb-3 text-xs text-muted-foreground uppercase tracking-wider">Pinned Messages</h3>
                <div className="text-sm text-muted-foreground mb-6 bg-muted/20 p-3 rounded-lg border border-border/40">
                  No pinned messages yet.
                </div>
                
                <h3 className="font-semibold mb-3 text-xs text-muted-foreground uppercase tracking-wider">Shared Files</h3>
                <div className="text-sm text-muted-foreground mb-6 bg-muted/20 p-3 rounded-lg border border-border/40">
                  No shared files yet.
                </div>
                
                {project.deadline && (
                  <>
                    <h3 className="font-semibold mb-3 text-xs text-muted-foreground uppercase tracking-wider">Upcoming Deadline</h3>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-sm font-medium">{new Date(project.deadline).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Project completion target</p>
                    </div>
                  </>
                )}
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
