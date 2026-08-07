import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { adminAuth } from "@/lib/firebase-admin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; announcementId: string }> }) {
  try {
    const { id: projectId, announcementId } = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    if (project.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden: Only owner can edit announcements" }, { status: 403 });
    }

    const announcement = await prisma.projectAnnouncement.findUnique({
      where: { id: announcementId, projectId }
    });

    if (!announcement) return NextResponse.json({ error: "Announcement not found" }, { status: 404 });

    const body = await req.json();
    const { title, content, isPinned, commentsLocked, attachments } = body;

    if (isPinned && !announcement.isPinned) {
      const pinnedCount = await prisma.projectAnnouncement.count({
        where: { projectId, isPinned: true }
      });
      if (pinnedCount >= 3) {
        return NextResponse.json({ error: "Maximum of 3 pinned announcements allowed" }, { status: 400 });
      }
    }

    const updated = await prisma.projectAnnouncement.update({
      where: { id: announcementId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(isPinned !== undefined && { isPinned }),
        ...(commentsLocked !== undefined && { commentsLocked }),
        ...(attachments !== undefined && { attachments }),
      },
      include: {
        author: {
          select: {
            profile: { select: { fullName: true, photo: true } },
          }
        },
        reactions: true,
        _count: { select: { comments: true } }
      }
    });

    return NextResponse.json({ ...updated, authorRole: "Owner" });
  } catch (error: any) {
    console.error("Update announcement error:", error);
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; announcementId: string }> }) {
  try {
    const { id: projectId, announcementId } = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    if (project.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden: Only owner can delete announcements" }, { status: 403 });
    }

    const announcement = await prisma.projectAnnouncement.findUnique({
      where: { id: announcementId, projectId }
    });

    if (!announcement) return NextResponse.json({ error: "Announcement not found" }, { status: 404 });

    await prisma.projectAnnouncement.delete({ where: { id: announcementId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete announcement error:", error);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
