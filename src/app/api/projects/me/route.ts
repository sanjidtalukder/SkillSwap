import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);
    const searchParams = request.nextUrl.searchParams;

    const limit = 10;
    const createdPage = Math.max(1, parseInt(searchParams.get("createdPage") || "1", 10));
    const joinedPage = Math.max(1, parseInt(searchParams.get("joinedPage") || "1", 10));
    const requestsPage = Math.max(1, parseInt(searchParams.get("requestsPage") || "1", 10));

    // 1. My Created Projects
    const [createdTotal, createdProjects] = await Promise.all([
      prisma.project.count({ where: { ownerId: user!.id } }),
      prisma.project.findMany({
        where: { ownerId: user!.id },
        skip: (createdPage - 1) * limit,
        take: limit,
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
      })
    ]);

    // 2. Projects I Joined
    const [joinedTotal, joinedProjects] = await Promise.all([
      prisma.projectMember.count({ where: { userId: user!.id } }),
      prisma.projectMember.findMany({
        where: { userId: user!.id },
        skip: (joinedPage - 1) * limit,
        take: limit,
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
      })
    ]);

    // 3. Requests (Pending only for the dashboard usually, but we fetch all and paginate pending?)
    // The previous implementation fetched all requests and filtered them on the backend:
    // const pendingRequests = requests.filter(r => r.status === "pending");
    // To paginate properly, we should query specifically for pending requests if that's what the UI uses.
    // Let's paginate pending requests.
    const [requestsTotal, pendingRequests] = await Promise.all([
      prisma.projectJoinRequest.count({ where: { userId: user!.id, status: "pending" } }),
      prisma.projectJoinRequest.findMany({
        where: { userId: user!.id, status: "pending" },
        skip: (requestsPage - 1) * limit,
        take: limit,
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
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        createdProjects: {
          items: createdProjects,
          currentPage: createdPage,
          totalPages: Math.ceil(createdTotal / limit),
          totalItems: createdTotal,
        },
        joinedProjects: {
          items: joinedProjects.map(jp => jp.project),
          currentPage: joinedPage,
          totalPages: Math.ceil(joinedTotal / limit),
          totalItems: joinedTotal,
        },
        pendingRequests: {
          items: pendingRequests,
          currentPage: requestsPage,
          totalPages: Math.ceil(requestsTotal / limit),
          totalItems: requestsTotal,
        },
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
