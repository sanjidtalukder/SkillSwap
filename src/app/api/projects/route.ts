import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map projects to a client-friendly format
    const formattedProjects = projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      ownerId: p.ownerId,
      ownerName: p.owner.profile?.fullName || "SkillSwap Member",
      ownerPhoto: p.owner.profile?.photo || "",
      createdAt: p.createdAt,
    }));

    return NextResponse.json({ success: true, data: formattedProjects });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await verifyAuth(request);
    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ success: false, error: "Title and description are required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        ownerId: user!.id,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
