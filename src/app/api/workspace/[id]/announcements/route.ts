import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { adminAuth } from "@/lib/firebase-admin";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const search = searchParams.get("search");
    const filter = searchParams.get("filter");
    const limit = 10;

    let whereClause: any = { projectId };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { author: { profile: { fullName: { contains: search, mode: "insensitive" } } } }
      ];
    }

    if (filter === "pinned") {
      whereClause.isPinned = true;
    } else if (filter === "attachments") {
      whereClause.attachments = { isEmpty: false };
    }

    const orderBy: any = filter === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

    const announcements = await prisma.projectAnnouncement.findMany({
      where: whereClause,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: [
        { isPinned: "desc" }, // Pinned always at top unless it's a specific filter query without this requirement, but standard is pinned first.
        orderBy
      ],
      include: {
        author: {
          select: {
            profile: { select: { fullName: true, photo: true } },
            projectMembers: {
              where: { projectId },
              select: { role: true }
            }
          }
        },
        reactions: {
          select: { emoji: true, userId: true, user: { select: { profile: { select: { fullName: true } } } } }
        },
        _count: {
          select: { comments: true }
        }
      }
    });

    let nextCursor: string | null = null;
    if (announcements.length > limit) {
      const nextItem = announcements.pop();
      nextCursor = nextItem!.id;
    }

    // Format the response slightly
    const formatted = announcements.map(ann => ({
      ...ann,
      authorRole: ann.authorId === project.ownerId ? "Owner" : (ann.author.projectMembers[0]?.role || "Member"),
    }));

    return NextResponse.json({ announcements: formatted, nextCursor });
  } catch (error: any) {
    console.error("Fetch announcements error:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden: Only owner can announce" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, isPinned, commentsLocked, attachments } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    // Check pinned limit
    if (isPinned) {
      const pinnedCount = await prisma.projectAnnouncement.count({
        where: { projectId, isPinned: true }
      });
      if (pinnedCount >= 3) {
        return NextResponse.json({ error: "Maximum of 3 pinned announcements allowed" }, { status: 400 });
      }
    }

    const announcement = await prisma.projectAnnouncement.create({
      data: {
        projectId,
        authorId: user.id,
        title,
        content,
        isPinned: isPinned || false,
        commentsLocked: commentsLocked || false,
        attachments: attachments || [],
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

    // Create notifications for all members
    const memberIds = project.members.map(m => m.userId);
    if (memberIds.length > 0) {
      await prisma.notification.createMany({
        data: memberIds.map(memberId => ({
          recipientId: memberId,
          senderId: user.id,
          type: "NEW_ANNOUNCEMENT",
          title: "New Announcement",
          body: title,
          linkUrl: `/workspace/${projectId}?tab=announcements`,
        }))
      });
    }

    return NextResponse.json({ ...announcement, authorRole: "Owner" });
  } catch (error: any) {
    console.error("Create announcement error:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
