import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Users, 
  Calendar, 
  Briefcase, 
  Activity,
  FileText,
  UserPlus,
  Target,
  LayoutDashboard
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function OverviewTab({ project, setActiveTab }: { project: any, setActiveTab?: (tab: string) => void }) {
  // Task Progress Calculation
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter((t: any) => t.status === "DONE").length || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter Active Tasks (Not DONE) - Limit to 2 for compact dashboard
  const activeTasks = project.tasks?.filter((t: any) => t.status !== "DONE").slice(0, 2) || [];
  
  // Limit recent activities to 4
  const recentActivities = project.activities?.slice(0, 4) || [];

  // Member compilation
  const allMembers = [
    { ...project.owner, role: "Owner" },
    ...project.members.map((m: any) => ({ ...m.user, role: m.role }))
  ];

  // Helper for activity icons
  const getActivityIcon = (type: string) => {
    if (type.includes("TASK")) return <CheckCircle2 className="w-4 h-4 text-primary" />;
    if (type.includes("MEMBER")) return <UserPlus className="w-4 h-4 text-green-500" />;
    if (type.includes("FILE")) return <FileText className="w-4 h-4 text-blue-500" />;
    if (type.includes("DEADLINE")) return <Calendar className="w-4 h-4 text-orange-500" />;
    return <Activity className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. PROJECT HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-3">
            <Badge variant={project.status === "active" ? "success" : "secondary"} className="uppercase tracking-wider text-[10px]">
              {project.status === "active" ? "Active Project" : project.status}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Created {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-foreground">{project.title}</h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed line-clamp-3">
              {project.description}
            </p>
          </div>
        </div>

        {/* Members Cluster */}
        <div className="flex flex-col items-start md:items-end gap-2 bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Team</span>
          <div className="flex items-center">
            <div className="flex -space-x-3">
              {allMembers.slice(0, 5).map((member: any, i: number) => (
                <div key={member.id} className="relative ring-2 ring-background rounded-full z-10 hover:z-20 transition-transform hover:scale-110">
                  <Avatar src={member.profile?.photo} alt={member.profile?.fullName} size="sm" />
                </div>
              ))}
            </div>
            {allMembers.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background -ml-3 z-0">
                +{allMembers.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. TASK PROGRESS */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Task Progress
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
              </div>
              <span className="text-3xl font-black text-primary">{progressPercentage}%</span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 blur-[2px]" />
              </div>
            </div>
          </div>
          
          {/* Quick Metrics */}
          <div className="flex gap-8 md:border-l border-border/50 md:pl-8 w-full md:w-auto">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground font-medium">Pending</span>
              <span className="text-2xl font-bold">{totalTasks - completedTasks}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground font-medium">Files</span>
              <span className="text-2xl font-bold">{project.files?.length || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground font-medium">Discussions</span>
              <span className="text-2xl font-bold">{project.conversation?.messages?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Tasks & Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 3. ACTIVE TASKS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Active Tasks
              </h3>
            </div>
            
            {activeTasks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeTasks.map((task: any) => (
                  <div key={task.id} className="bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:border-primary/30 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant={task.priority === "HIGH" ? "destructive" : task.priority === "MEDIUM" ? "warning" : "secondary"} className="text-[9px]">
                        {task.priority}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {task.status === "IN_PROGRESS" ? <Circle className="w-3 h-3 text-blue-500 fill-blue-500/20" /> : <Circle className="w-3 h-3" />}
                        {task.status.replace("_", " ")}
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">{task.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">{task.description || "No description provided."}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        {task.assignee ? (
                          <>
                            <Avatar src={task.assignee.profile?.photo} alt={task.assignee.profile?.fullName} size="sm" className="w-6 h-6" />
                            <span className="text-xs font-medium text-foreground truncate max-w-[100px]">{task.assignee.profile?.fullName}</span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </div>
                      {task.deadline && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/20 border border-dashed border-border rounded-xl p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h4 className="font-semibold text-foreground">You&apos;re all caught up!</h4>
                <p className="text-sm text-muted-foreground mt-1">No active tasks at the moment.</p>
              </div>
            )}
            
            {totalTasks > 0 && (
              <button 
                onClick={() => setActiveTab && setActiveTab("tasks")}
                className="mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group"
              >
                View all tasks <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            )}
          </div>

          {/* 5. PROJECT INFORMATION */}
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5" />
              Project Details
            </h3>
            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Category</p>
                <p className="font-semibold">{project.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Difficulty</p>
                <p className="font-semibold">{project.difficulty}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Team Size</p>
                <p className="font-semibold">{project.teamSize} Max</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Deadline</p>
                <p className="font-semibold">{project.deadline ? new Date(project.deadline).toLocaleDateString() : "None"}</p>
              </div>
              
              {project.requiredSkills?.length > 0 && (
                <div className="col-span-2 sm:col-span-4 pt-4 border-t border-border/40">
                  <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wider">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map((skill: string) => (
                      <span key={skill} className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5" />
              Recent Activity
            </h3>
            
            <div className="space-y-6">
              {recentActivities.length > 0 ? (
                <div className="relative border-l border-border/50 ml-3 space-y-8 pb-2">
                  {recentActivities.map((activity: any, index: number) => (
                    <div key={activity.id} className="relative pl-6">
                      <span className="absolute -left-[13px] top-1 w-6 h-6 bg-background rounded-full border border-border/50 flex items-center justify-center shadow-sm">
                        {getActivityIcon(activity.type)}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">{activity.content}</span>
                        <span className="text-xs text-muted-foreground mt-1 font-medium">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center opacity-70">
                  <Activity className="w-8 h-8 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
