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

    // 1. Total Skills
    const totalSkills = await prisma.userSkill.count({
      where: { userId: dbUser.id }
    });

    // 2. Active Projects (Owned or Joined)
    const activeProjects = await prisma.project.count({
      where: {
        status: "active",
        OR: [
          { ownerId: dbUser.id },
          { members: { some: { userId: dbUser.id } } }
        ]
      }
    });

    // 3. Connections (Accepted MatchRequests)
    const connections = await prisma.matchRequest.count({
      where: {
        status: "accepted",
        OR: [
          { senderId: dbUser.id },
          { receiverId: dbUser.id }
        ]
      }
    });

    // 4. Pending Requests (MatchRequests received pending + ProjectJoinRequests received pending)
    const pendingMatchRequests = await prisma.matchRequest.count({
      where: { receiverId: dbUser.id, status: "pending" }
    });
    
    const pendingProjectRequests = await prisma.projectJoinRequest.count({
      where: { project: { ownerId: dbUser.id }, status: "pending" }
    });
    
    const pendingRequests = pendingMatchRequests + pendingProjectRequests;

    // 5. Recent Activity: Latest Projects (Global discovery)
    const latestProjects = await prisma.project.findMany({
      where: { status: "active", ownerId: { not: dbUser.id } },
      include: {
        owner: { include: { profile: true } },
        _count: { select: { members: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 3
    });

    // 6. Recent Activity: Latest Connections
    const latestConnections = await prisma.matchRequest.findMany({
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
    });

    // 7. Recent Activity: Latest Notifications
    const latestNotifications = await prisma.notification.findMany({
      where: { recipientId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 3
    });

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
