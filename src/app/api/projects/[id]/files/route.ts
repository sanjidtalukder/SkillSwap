import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { storageService } from "@/lib/storage/storage.service";
import { adminAuth } from "@/lib/firebase-admin";

const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "10485760", 10); // 10MB default

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "application/zip",
  "application/x-rar-compressed",
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "text/plain",
  "text/markdown",
  "application/json",
];

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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Verify membership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const isOwner = project.ownerId === user.id;

    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden: Only Project Owners can upload files" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds limit (10MB)" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type) && file.type !== "") {
       // Allow empty mime type if it's a known extension fallback, but for strictness we can reject
       // For this implementation, we will strictly check if it's supported
       return NextResponse.json({ error: "File type not supported" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name;
    const extension = originalName.split('.').pop() || "";

    const { url, storedName } = await storageService.upload(buffer, originalName, file.type);

    const projectFile = await prisma.projectFile.create({
      data: {
        projectId,
        uploaderId: user.id,
        originalName,
        storedName,
        url,
        size: file.size,
        mimeType: file.type,
        extension,
      },
      include: {
        uploader: {
          select: {
            profile: { select: { fullName: true, photo: true } },
          },
        },
      },
    });

    return NextResponse.json(projectFile);
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: "Forbidden: Not a project member" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const search = searchParams.get("search");
    const filter = searchParams.get("filter"); // image, document, archive, code, other
    const sort = searchParams.get("sort") || "newest"; // newest, oldest, name-asc, name-desc, largest, smallest
    const limit = 15;

    let whereClause: any = { projectId };

    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          { originalName: { contains: search, mode: "insensitive" } },
          { uploader: { profile: { fullName: { contains: search, mode: "insensitive" } } } },
        ],
      };
    }

    if (filter) {
      if (filter === "image") {
        whereClause.mimeType = { startsWith: "image/" };
      } else if (filter === "document") {
        whereClause.extension = { in: ["pdf", "docx", "pptx", "xlsx", "txt"] };
      } else if (filter === "archive") {
        whereClause.extension = { in: ["zip", "rar"] };
      } else if (filter === "code") {
        whereClause.extension = { in: ["json", "md", "ts", "js", "html", "css"] };
      }
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    if (sort === "name-asc") orderBy = { originalName: "asc" };
    if (sort === "name-desc") orderBy = { originalName: "desc" };
    if (sort === "largest") orderBy = { size: "desc" };
    if (sort === "smallest") orderBy = { size: "asc" };

    const files = await prisma.projectFile.findMany({
      where: whereClause,
      take: limit + 1, // take one extra to see if there's a next page
      cursor: cursor ? { id: cursor } : undefined,
      orderBy,
      include: {
        uploader: {
          select: {
            profile: { select: { fullName: true, photo: true } },
          },
        },
      },
    });

    let nextCursor: string | null = null;
    if (files.length > limit) {
      const nextItem = files.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      files,
      nextCursor,
    });
  } catch (error: any) {
    console.error("Fetch files error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
