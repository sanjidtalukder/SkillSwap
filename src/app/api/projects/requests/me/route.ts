import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);
    
    // Fetch received requests (for projects the user owns)
    const receivedRequests = await prisma.projectJoinRequest.findMany({
      where: {
        project: { ownerId: user!.id },
      },
      include: {
        project: {
          select: { id: true, title: true, requiredSkills: true }
        },
        user: {
          include: {
            profile: true,
            skillsHave: { include: { skill: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Fetch sent requests (by the current user)
    const sentRequests = await prisma.projectJoinRequest.findMany({
      where: {
        userId: user!.id
      },
      include: {
        project: {
          select: { id: true, title: true, owner: { include: { profile: true } } }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      data: {
        received: receivedRequests,
        sent: sentRequests,
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
