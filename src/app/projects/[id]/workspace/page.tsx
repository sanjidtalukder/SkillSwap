import React from "react";
import prisma from "@/lib/prisma.server";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatDistanceToNow } from "date-fns";
import { Activity, Code, Users } from "lucide-react";

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: { include: { profile: true } },
      members: { include: { user: { include: { profile: true } } } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20
      }
    }
  });

  if (!project) return null;

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
        <p className="text-muted-foreground">{project.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-card border border-border/40 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" /> Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Category</p>
                <p className="font-medium">{project.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Difficulty</p>
                <Badge variant="outline">{project.difficulty}</Badge>
              </div>
              {project.deadline && (
                <div>
                  <p className="text-muted-foreground mb-1">Deadline</p>
                  <p className="font-medium text-orange-400">
                    {new Date(project.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/40">
              <p className="text-muted-foreground mb-2 text-sm">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map(s => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-card border border-border/40 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Recent Activity
            </h2>
            <div className="space-y-4">
              {project.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                project.activities.map(act => (
                  <div key={act.id} className="flex gap-4 p-3 rounded-lg bg-muted/20">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="text-sm">{act.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-card border border-border/40 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Team ({project.members.length + 1}/{project.teamSize})
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar src={project.owner.profile?.photo || ""} alt={project.owner.profile?.fullName || ""} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{project.owner.profile?.fullName}</p>
                  <Badge variant="success" className="text-[10px] px-1 py-0">Owner</Badge>
                </div>
              </div>
              
              {project.members.map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar src={member.user.profile?.photo || ""} alt={member.user.profile?.fullName || ""} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.user.profile?.fullName}</p>
                    <p className="text-xs text-muted-foreground capitalize truncate">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
