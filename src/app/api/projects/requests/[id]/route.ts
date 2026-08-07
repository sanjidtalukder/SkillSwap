import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

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
          linkUrl: `/projects/${joinRequest.projectId}`
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
