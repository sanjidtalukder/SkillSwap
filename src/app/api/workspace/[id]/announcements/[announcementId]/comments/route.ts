import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { adminAuth } from "@/lib/firebase-admin";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; announcementId: string }> }) {
  try {
    const { id: projectId, announcementId } = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const isOwner = project.ownerId === user.id;
    const isMember = project.members.some((m) => m.userId === user.id);

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const comments = await prisma.announcementComment.findMany({
      where: { announcementId },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: {
            profile: { select: { fullName: true, photo: true } },
            projectMembers: {
              where: { projectId },
              select: { role: true }
            }
          }
        }
      }
    });

    const formatted = comments.map(c => ({
      ...c,
      authorRole: c.authorId === project.ownerId ? "Owner" : (c.author.projectMembers[0]?.role || "Member"),
    }));

    return NextResponse.json({ comments: formatted });
  } catch (error: any) {
    console.error("Fetch comments error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; announcementId: string }> }) {
  try {
    const { id: projectId, announcementId } = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const isOwner = project.ownerId === user.id;
    const isMember = project.members.some((m) => m.userId === user.id);

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const announcement = await prisma.projectAnnouncement.findUnique({
      where: { id: announcementId, projectId }
    });

    if (!announcement) return NextResponse.json({ error: "Announcement not found" }, { status: 404 });

    if (announcement.commentsLocked) {
      return NextResponse.json({ error: "Comments are locked" }, { status: 403 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const comment = await prisma.announcementComment.create({
      data: {
        announcementId,
        authorId: user.id,
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            profile: { select: { fullName: true, photo: true } },
            projectMembers: {
              where: { projectId },
              select: { role: true }
            }
          }
        }
      }
    });

    const formatted = {
      ...comment,
      authorRole: comment.authorId === project.ownerId ? "Owner" : (comment.author.projectMembers[0]?.role || "Member"),
    };

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
