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
      return NextResponse.json({ success: false, error: "Request already exists" }, { status: 400 });
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: id, userId: user!.id }
      }
    });

    if (existingMember) {
      return NextResponse.json({ success: false, error: "You are already a member" }, { status: 400 });
    }

    const joinRequest = await prisma.projectJoinRequest.create({
      data: {
        projectId: id,
        userId: user!.id,
      },
    });

    // Optionally create a notification here to the project owner
    await prisma.notification.create({
      data: {
        recipientId: project.ownerId,
        senderId: user!.id,
        type: "project_join_request",
        title: "New Join Request",
        body: `Someone requested to join your project: ${project.title}`,
        linkUrl: `/projects/${project.id}`,
      }
    });

    return NextResponse.json({ success: true, data: joinRequest });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
