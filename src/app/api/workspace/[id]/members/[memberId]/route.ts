import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, memberId: string }> }
) {
  try {
    const { user } = await verifyAuth(request);
    const resolvedParams = await params;
    const { id: projectId, memberId: targetUserId } = resolvedParams;

    // Verify current user is the owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { conversation: true }
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    if (project.ownerId !== user!.id) {
      return NextResponse.json({ success: false, error: "Only the project owner can remove members" }, { status: 403 });
    }

    if (project.ownerId === targetUserId) {
      return NextResponse.json({ success: false, error: "Cannot remove the project owner" }, { status: 400 });
    }

    // Delete ProjectMember
    const deletedMember = await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUserId
        }
      }
    });

    // Remove them from the group chat conversation
    if (project.conversationId) {
      await prisma.conversationParticipant.deleteMany({
        where: {
          conversationId: project.conversationId,
          userId: targetUserId
        }
      });
    }

    return NextResponse.json({ success: true, data: deletedMember });
  } catch (error) {
    console.error("Failed to remove member:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
