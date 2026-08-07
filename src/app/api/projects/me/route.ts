import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);

    // 1. My Created Projects
    const createdProjects = await prisma.project.findMany({
      where: { ownerId: user!.id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        teamSize: true,
        _count: { 
          select: { 
            members: true,
            joinRequests: {
              where: { status: "pending" }
            }
          } 
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Projects I Joined
    const joinedProjects = await prisma.projectMember.findMany({
      where: { userId: user!.id },
      select: {
        project: {
          select: {
            id: true,
            title: true,
            teamSize: true,
            _count: {
              select: { members: true }
            },
            owner: { select: { profile: { select: { fullName: true } } } }
          }
        },
      },
      orderBy: { project: { createdAt: "desc" } }
    });

    // 3. Requests (Pending, Accepted, Rejected)
    const requests = await prisma.projectJoinRequest.findMany({
      where: { userId: user!.id },
      select: {
        id: true,
        status: true,
        createdAt: true,
        project: {
          select: {
            title: true,
            owner: {
              select: {
                profile: {
                  select: { fullName: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const pendingRequests = requests.filter(r => r.status === "pending");
    const acceptedRequests = requests.filter(r => r.status === "accepted");
    const rejectedRequests = requests.filter(r => r.status === "rejected");

    return NextResponse.json({
      success: true,
      data: {
        createdProjects,
        joinedProjects: joinedProjects.map(jp => jp.project),
        pendingRequests,
        acceptedRequests,
        rejectedRequests,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
