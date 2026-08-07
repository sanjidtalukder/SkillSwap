import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { adminAuth } from "@/lib/firebase-admin";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  try {
    const { id: projectId, fileId } = await params;
    
    // Auth for GET request is tricky since we might be downloading from a direct link or <a> tag.
    // We can use a query parameter `token` if Authorization header is missing.
    const { searchParams } = new URL(req.url);
    const tokenQuery = searchParams.get("token");
    let authHeader = req.headers.get("Authorization");

    let token = "";
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split("Bearer ")[1];
    } else if (tokenQuery) {
      token = tokenQuery;
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      return NextResponse.json({ error: "Forbidden: Not a project member" }, { status: 403 });
    }

    const file = await prisma.projectFile.findUnique({
      where: { id: fileId, projectId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Increment download count
    await prisma.projectFile.update({
      where: { id: fileId },
      data: { downloadCount: { increment: 1 } },
    });

    // Redirect to actual storage URL
    // In a real S3 setup, this would generate a signed URL and redirect.
    // Since we are using LocalStorageService in `public/uploads/projects`, the URL is just `/uploads/projects/xxx.pdf`
    return NextResponse.redirect(new URL(file.url, req.url));
  } catch (error: any) {
    console.error("File download error:", error);
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
  }
}
