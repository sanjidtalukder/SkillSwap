import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    let currentUser = null;
    try {
      const { user } = await verifyAuth(request);
      currentUser = user;
    } catch (e) {
      // User is not authenticated, ignore
    }

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        requiredSkills: true,
        technologies: true,
        teamSize: true,
        difficulty: true,
        deadline: true,
        status: true,
        createdAt: true,
        ownerId: true,
        owner: {
          select: {
            firebaseUid: true,
            profile: {
              select: { fullName: true, photo: true, university: true, username: true }
            }
          }
        },
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                firebaseUid: true,
                profile: { select: { fullName: true, photo: true, university: true, username: true } }
              }
            }
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    let joinRequestStatus = null;
    if (currentUser) {
      const joinReq = await prisma.projectJoinRequest.findUnique({
        where: { projectId_userId: { projectId: id, userId: currentUser.id } }
      });
      joinRequestStatus = joinReq?.status || null;
    }

    const formattedProject = {
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      requiredSkills: project.requiredSkills,
      technologies: project.technologies,
      teamSize: project.teamSize,
      difficulty: project.difficulty,
      deadline: project.deadline,
      status: project.status,
      ownerId: project.owner.firebaseUid, // Send Firebase UID so frontend can match
      ownerName: project.owner.profile?.fullName || "SkillSwap Member",
      ownerPhoto: project.owner.profile?.photo || "",
      ownerUniversity: project.owner.profile?.university || "",
      ownerUsername: project.owner.profile?.username || "",
      createdAt: project.createdAt,
      joinRequestStatus,
      members: project.members.map((m: any) => ({
        id: m.id,
        userId: m.user.firebaseUid,
        role: m.role,
        name: m.user.profile?.fullName || "Member",
        photo: m.user.profile?.photo || "",
        university: m.user.profile?.university || "",
        username: m.user.profile?.username || "",
      })),
    };

    return NextResponse.json({ success: true, data: formattedProject });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { user } = await verifyAuth(request);
    
    // Check ownership
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.ownerId !== user!.id) {
      return NextResponse.json({ success: false, error: "Unauthorized or not found" }, { status: 403 });
    }

    const body = await request.json();
    // Prevent updating ownerId or id
    delete body.id;
    delete body.ownerId;
    delete body.createdAt;

    if (body.deadline) {
      body.deadline = new Date(body.deadline);
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, data: updatedProject });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { user } = await verifyAuth(request);
    
    // Check ownership
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.ownerId !== user!.id) {
      return NextResponse.json({ success: false, error: "Unauthorized or not found" }, { status: 403 });
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
