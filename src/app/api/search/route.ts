import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";

function profileFromUser(user: any) {
  return {
    uid: user.id,
    firebaseUID: user.firebaseUid,
    name: user.profile?.fullName || "",
    email: user.email || "",
    photo: user.profile?.photo || "",
    university: user.profile?.university || "",
    department: user.profile?.department || "",
    semester: user.profile?.semester || "",
    location: user.profile?.location || "",
    bio: user.profile?.bio || "",
    skillsHave: user.skillsHave.map((us: any) => us.skill.name),
    skillsNeed: user.skillsNeed.map((us: any) => us.skill.name),
    github: user.profile?.github || "",
    linkedin: user.profile?.linkedin || "",
    portfolio: user.profile?.portfolio || "",
    experience: user.profile?.experience || "Beginner",
    availability: user.profile?.availability || "Part Time",
    profileCompleted: user.profile?.profileCompleted || false,
    createdAt: user.profile?.createdAt || new Date(),
    updatedAt: user.profile?.updatedAt || new Date(),
    fullName: user.profile?.fullName || "",
    avatarUrl: user.profile?.photo || "",
    skillsOffered: user.skillsHave.map((us: any) => us.skill.name),
    skillsWanted: user.skillsNeed.map((us: any) => us.skill.name),
    searchKeywords: [],
    rating: user.profile?.rating || 5.0,
    completedSwaps: user.profile?.completedSwaps || 0,
    isOnline: user.profile?.isOnline || false,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skill = searchParams.get("skill") || "";
  const department = searchParams.get("department") || "";
  const semester = searchParams.get("semester") || "";
  const searchTerm = searchParams.get("searchTerm") || "";
  const pageSize = Math.min(Number(searchParams.get("pageSize") || "15"), 50);

  try {
    const where: any = {
      profile: { profileCompleted: true },
    };

    if (skill.trim().length > 0) {
      where.skillsHave = {
        some: {
          skill: { name: { contains: skill.trim(), mode: "insensitive" } },
        },
      };
    } else if (department.trim().length > 0) {
      where.profile = { ...where.profile, department: department.trim() };
    } else if (semester.trim().length > 0) {
      where.profile = { ...where.profile, semester: semester.trim() };
    } else if (searchTerm.trim().length > 0) {
      const term = searchTerm.trim().toLowerCase();
      where.OR = [
        { profile: { fullName: { contains: term, mode: "insensitive" } } },
        {
          searchKeywords: {
            some: { keyword: { contains: term, mode: "insensitive" } },
          },
        },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        profile: true,
        skillsHave: { include: { skill: true } },
        skillsNeed: { include: { skill: true } },
      },
      take: pageSize + 1,
      orderBy: { profile: { updatedAt: "desc" } },
    });

    const hasMore = users.length > pageSize;
    const resultUsers = hasMore ? users.slice(0, pageSize) : users;

    return NextResponse.json({
      users: resultUsers.map(profileFromUser),
      hasMore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
