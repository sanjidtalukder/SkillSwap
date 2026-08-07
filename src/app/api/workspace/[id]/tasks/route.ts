import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await verifyAuth(request);
    const resolvedParams = await params;
    const body = await request.json();
    
    // Check permission
    const project = await prisma.project.findUnique({
      where: { id: resolvedParams.id },
      include: { members: true }
    });
    
    if (!project || (project.ownerId !== user!.id && !project.members.some(m => m.userId === user!.id))) {
      return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 });
    }

    // @ts-ignore - Prisma types might not be generated yet
    const task = await prisma.projectTask.create({
      data: {
        projectId: resolvedParams.id,
        title: body.title,
        status: body.status || "TODO",
        priority: body.priority || "MEDIUM",
        description: body.description || null,
        assigneeId: body.assigneeId || null,
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
      include: {
        assignee: { include: { profile: true } }
      }
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Unknown error" }, { status: 500 });
  }
}
