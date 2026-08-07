import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { storageService } from "@/lib/storage/storage.service";
import { adminAuth } from "@/lib/firebase-admin";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  try {
    const { id: projectId, fileId } = await params;
    
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
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const file = await prisma.projectFile.findUnique({
      where: { id: fileId, projectId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const isOwner = project.ownerId === user.id;

    if (!isOwner && file.uploaderId !== user.id) {
      return NextResponse.json({ error: "Forbidden: Only project owners or the uploader can delete this file" }, { status: 403 });
    }

    // Delete from storage
    await storageService.delete(file.storedName);

    // Delete from DB
    await prisma.projectFile.delete({
      where: { id: fileId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("File delete error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  try {
    const { id: projectId, fileId } = await params;
    
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
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const file = await prisma.projectFile.findUnique({
      where: { id: fileId, projectId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const isOwner = project.ownerId === user.id;

    if (!isOwner && file.uploaderId !== user.id) {
      return NextResponse.json({ error: "Forbidden: Only project owners or the uploader can rename this file" }, { status: 403 });
    }

    const body = await req.json();
    const { originalName } = body;

    if (!originalName || typeof originalName !== "string") {
      return NextResponse.json({ error: "Invalid new name" }, { status: 400 });
    }

    const updatedFile = await prisma.projectFile.update({
      where: { id: fileId },
      data: { originalName },
    });

    return NextResponse.json(updatedFile);
  } catch (error: any) {
    console.error("File rename error:", error);
    return NextResponse.json({ error: "Failed to rename file" }, { status: 500 });
  }
}
