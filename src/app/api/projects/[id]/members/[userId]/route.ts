import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";
import { logProjectActivity } from "@/features/projects/services/activityService";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId: targetUserId } = await params;

  try {
    const { user } = await verifyAuth(request);
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: { members: { include: { user: { include: { profile: true } } } } }
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const isOwner = project.ownerId === user!.id;
    const isSelf = targetUserId === user!.id;

    if (!isOwner && !isSelf) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (isSelf && project.ownerId === user!.id) {
      return NextResponse.json({ success: false, error: "Owner cannot leave the project" }, { status: 400 });
    }

    const targetMember = project.members.find(m => m.userId === targetUserId);
    if (!targetMember) {
      return NextResponse.json({ success: false, error: "User is not a member" }, { status: 400 });
    }

    // Remove from ProjectMember
    await prisma.projectMember.delete({
      where: { id: targetMember.id }
    });

    // Remove from Conversation if it exists
    if (project.conversationId) {
      await prisma.conversationParticipant.deleteMany({
        where: {
          conversationId: project.conversationId,
          userId: targetUserId
        }
      });
    }

    // Log Activity
    const targetName = targetMember.user.profile?.fullName || "A user";
    if (isSelf) {
      await logProjectActivity({
        projectId: id,
        type: "MEMBER_LEFT",
        content: `${targetName} left the project.`,
        actorId: user!.id,
      });
    } else {
      await logProjectActivity({
        projectId: id,
        type: "MEMBER_KICKED",
        content: `Owner removed ${targetName} from the project.`,
        actorId: user!.id,
      });

      // Notify the kicked user
      await prisma.notification.create({
        data: {
          recipientId: targetUserId,
          senderId: user!.id,
          type: "project_kicked",
          title: "Removed from Project",
          body: `You have been removed from the project "${project.title}".`,
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
