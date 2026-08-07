import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const { user: authUser } = await verifyAuth(request);
    
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Run all independent queries concurrently
    const [
      totalSkills,
      activeProjects,
      connections,
      pendingMatchRequests,
      pendingProjectRequests,
      latestProjects,
      latestConnections,
      latestNotifications
    ] = await Promise.all([
      prisma.userSkill.count({ where: { userId: dbUser.id } }),
      
      prisma.project.count({
        where: {
          status: "active",
          OR: [
            { ownerId: dbUser.id },
            { members: { some: { userId: dbUser.id } } }
          ]
        }
      }),

      prisma.matchRequest.count({
        where: {
          status: "accepted",
          OR: [
            { senderId: dbUser.id },
            { receiverId: dbUser.id }
          ]
        }
      }),

      prisma.matchRequest.count({
        where: { receiverId: dbUser.id, status: "pending" }
      }),

      prisma.projectJoinRequest.count({
        where: { project: { ownerId: dbUser.id }, status: "pending" }
      }),

      prisma.project.findMany({
        where: { status: "active", ownerId: { not: dbUser.id } },
        include: {
          owner: { include: { profile: true } },
          _count: { select: { members: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 3
      }),

      prisma.matchRequest.findMany({
        where: {
          status: "accepted",
          OR: [
            { senderId: dbUser.id },
            { receiverId: dbUser.id }
          ]
        },
        include: {
          sender: { include: { profile: true } },
          receiver: { include: { profile: true } }
        },
        orderBy: { updatedAt: "desc" },
        take: 3
      }),

      prisma.notification.findMany({
        where: { recipientId: dbUser.id },
        orderBy: { createdAt: "desc" },
        take: 3
      })
    ]);

    const pendingRequests = pendingMatchRequests + pendingProjectRequests;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalSkills,
          activeProjects,
          connections,
          pendingRequests
        },
        recentActivity: {
          latestProjects,
          latestConnections,
          latestNotifications
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Dashboard Stats API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
