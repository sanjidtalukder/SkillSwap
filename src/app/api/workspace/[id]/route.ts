import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";
import { canAccessWorkspace } from "@/utils/workspace-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await verifyAuth(request);
    const resolvedParams = await params;
    
    // Fetch project and ensure user is an accepted member or owner
    const project = await prisma.project.findUnique({
      where: { id: resolvedParams.id },
      include: {
        owner: {
          include: { profile: true }
        },
        members: {
          include: {
            user: { include: { profile: true } }
          }
        },
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 50,
              include: {
                sender: { include: { profile: true } }
              }
            }
          }
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          include: {
            assignee: { include: { profile: true } }
          }
        },
        files: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploader: { include: { profile: true } }
          }
        },
        announcements: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: { include: { profile: true } }
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const access = await canAccessWorkspace(user!.id, project.id);
    if (!access.hasAccess) {
      return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
