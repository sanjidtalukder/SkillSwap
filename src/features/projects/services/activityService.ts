import prisma from "@/lib/prisma.server";

export type ActivityType = 
  | "MEMBER_JOINED"
  | "MEMBER_LEFT"
  | "MEMBER_KICKED"
  | "PROJECT_UPDATED"
  | "DEADLINE_CHANGED"
  | "WORKSPACE_CREATED";

export async function logProjectActivity({
  projectId,
  type,
  content,
  actorId,
}: {
  projectId: string;
  type: ActivityType;
  content: string;
  actorId?: string;
}) {
  try {
    const activity = await prisma.projectActivity.create({
      data: {
        projectId,
        type,
        content,
        actorId,
      },
    });
    return activity;
  } catch (error) {
    console.error("Failed to log project activity:", error);
    return null;
  }
}
