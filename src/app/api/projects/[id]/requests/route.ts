import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { user } = await verifyAuth(request);
    
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    if (project.ownerId === user!.id) {
      return NextResponse.json({ success: false, error: "You cannot join your own project" }, { status: 400 });
    }

    if (project.status !== "active") {
      return NextResponse.json({ success: false, error: "Project is not active" }, { status: 400 });
    }

    // Check if request already exists
    const existing = await prisma.projectJoinRequest.findUnique({
      where: {
        projectId_userId: { projectId: id, userId: user!.id }
      }
    });

    if (existing) {
      if (existing.status === "rejected") {
        // Allow re-applying
        await prisma.projectJoinRequest.update({
          where: { id: existing.id },
          data: { status: "pending" }
        });
      } else {
        return NextResponse.json({ success: false, error: "Request already exists" }, { status: 400 });
      }
    } else {
      await prisma.projectJoinRequest.create({
        data: {
          projectId: id,
          userId: user!.id,
        },
      });
    }

    const applicantProfile = await prisma.profile.findUnique({ where: { userId: user!.id } });
    const applicantName = applicantProfile?.fullName || "Someone";

    // Send notification to the project owner
    await prisma.notification.create({
      data: {
        recipientId: project.ownerId,
        senderId: user!.id,
        type: "project_join_request",
        title: "New Join Request",
        body: `${applicantName} wants to join your project: ${project.title}`,
        linkUrl: `/dashboard?tab=requests`,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
