import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";
import { logProjectActivity } from "@/features/projects/services/activityService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { user } = await verifyAuth(request);
    const { action } = await request.json(); // "accept" or "reject"

    if (action !== "accept" && action !== "reject") {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    const joinRequest = await prisma.projectJoinRequest.findUnique({
      where: { id },
      include: { project: true, user: { include: { profile: true } } }
    });

    if (!joinRequest) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

    if (joinRequest.project.ownerId !== user!.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (joinRequest.status !== "pending") {
      return NextResponse.json({ success: false, error: "Request already processed" }, { status: 400 });
    }

    if (action === "accept") {
      // Create ProjectMember
      await prisma.projectMember.create({
        data: {
          projectId: joinRequest.projectId,
          userId: joinRequest.userId,
          role: "Member"
        }
      });

      // Ensure Project has a Conversation
      let conversationId = joinRequest.project.conversationId;
      if (!conversationId) {
        const newConv = await prisma.conversation.create({
          data: {
            participants: {
              create: [
                { userId: joinRequest.project.ownerId } // Add owner
              ]
            }
          }
        });
        conversationId = newConv.id;
        await prisma.project.update({
          where: { id: joinRequest.projectId },
          data: { conversationId }
        });
      }

      // Add applicant to Conversation
      await prisma.conversationParticipant.create({
        data: {
          conversationId,
          userId: joinRequest.userId,
        }
      });

      // Log Activity
      await logProjectActivity({
        projectId: joinRequest.projectId,
        type: "MEMBER_JOINED",
        content: `${joinRequest.user.profile?.fullName || "A user"} joined the project.`,
        actorId: joinRequest.userId,
      });

      // Update Request
      await prisma.projectJoinRequest.update({
        where: { id },
        data: { status: "accepted" }
      });

      // Send Notification to applicant
      await prisma.notification.create({
        data: {
          recipientId: joinRequest.userId,
          senderId: user!.id,
          type: "project_joined",
          title: "Request Accepted",
          body: `Your request to join "${joinRequest.project.title}" has been accepted.`,
          linkUrl: `/projects/${joinRequest.projectId}/workspace`
        }
      });

    } else if (action === "reject") {
      // Update Request
      await prisma.projectJoinRequest.update({
        where: { id },
        data: { status: "rejected" }
      });

      // Send Notification to applicant
      await prisma.notification.create({
        data: {
          recipientId: joinRequest.userId,
          senderId: user!.id,
          type: "project_rejected",
          title: "Request Rejected",
          body: `Your request to join "${joinRequest.project.title}" has been rejected.`,
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
