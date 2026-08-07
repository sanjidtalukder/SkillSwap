import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; announcementId: string }> }) {
  try {
    const { id: projectId, announcementId } = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const user = await prisma.user.findUnique({ 
      where: { firebaseUid: decoded.uid },
      include: { profile: true } 
    });

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

    const body = await req.json();
    const { emoji } = body;

    if (!emoji || typeof emoji !== "string") {
      return NextResponse.json({ error: "Valid emoji required" }, { status: 400 });
    }

    // Toggle logic
    const existing = await prisma.announcementReaction.findUnique({
      where: {
        announcementId_userId_emoji: {
          announcementId,
          userId: user.id,
          emoji,
        }
      }
    });

    if (existing) {
      await prisma.announcementReaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, action: "removed", emoji });
    } else {
      await prisma.announcementReaction.create({
        data: {
          announcementId,
          userId: user.id,
          emoji,
        }
      });
      return NextResponse.json({ success: true, action: "added", emoji, userId: user.id, user: { profile: { fullName: user.profile?.fullName || "User" } } });
    }

  } catch (error: any) {
    console.error("Toggle reaction error:", error);
    return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 500 });
  }
}
