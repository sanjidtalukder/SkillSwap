import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";
import { Prisma } from "@prisma/client";

export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const status = searchParams.get("status") || "active";
    
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = { status };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { requiredSkills: { hasSome: [search] } },
        { technologies: { hasSome: [search] } },
      ];
    }
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const [totalItems, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
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
          owner: {
            select: {
              firebaseUid: true,
              profile: {
                select: {
                  fullName: true,
                  photo: true,
                }
              }
            }
          },
          _count: {
            select: { members: true }
          }
        },
        orderBy: { createdAt: "desc" },
      })
    ]);

    const formattedProjects = projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      requiredSkills: p.requiredSkills,
      technologies: p.technologies,
      teamSize: p.teamSize,
      difficulty: p.difficulty,
      deadline: p.deadline,
      status: p.status,
      ownerId: p.owner.firebaseUid,
      ownerName: p.owner.profile?.fullName || "SkillSwap Member",
      ownerPhoto: p.owner.profile?.photo || "",
      currentMembers: p._count.members,
      createdAt: p.createdAt,
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({ 
      success: true, 
      data: {
        items: formattedProjects,
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      } 
    });
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
    const body = await request.json();
    const { title, description, category, requiredSkills, technologies, teamSize, difficulty, deadline } = body;

    if (!title || !description) {
      return NextResponse.json({ success: false, error: "Title and description are required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        category: category || "Other",
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
        technologies: Array.isArray(technologies) ? technologies : [],
        teamSize: typeof teamSize === "number" ? teamSize : 2,
        difficulty: difficulty || "Intermediate",
        deadline: deadline ? new Date(deadline) : null,
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
