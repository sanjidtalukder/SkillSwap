import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { ExperienceLevel, Availability } from "@/features/profiles/types/profile";

export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const skip = (page - 1) * limit;

    const where = {
      profile: {
        profileCompleted: true
      }
    };

    const [totalItems, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          firebaseUid: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              username: true,
              banner: true,
              photo: true,
              university: true,
              department: true,
              semester: true,
              location: true,
              bio: true,
              experience: true,
              availability: true,
              profileCompleted: true,
              rating: true,
              completedSwaps: true,
              isOnline: true,
              createdAt: true,
              updatedAt: true,
              github: true,
              linkedin: true,
              portfolio: true
            }
          },
          skillsHave: { select: { skill: { select: { name: true } } } },
          skillsNeed: { select: { skill: { select: { name: true } } } },
        },
        orderBy: {
          profile: { updatedAt: "desc" }
        }
      })
    ]);

    const formattedProfiles = users.map(user => {
      const experience: ExperienceLevel = (user.profile?.experience as ExperienceLevel) || "Beginner";
      const availability: Availability = (user.profile?.availability as Availability) || "Part Time";

      return {
        uid: user.id,
        firebaseUID: user.firebaseUid,
        name: user.profile?.fullName || "",
        username: user.profile?.username || "",
        banner: user.profile?.banner || "",
        email: user.email || "",
        photo: user.profile?.photo || "",
        university: user.profile?.university || "",
        department: user.profile?.department || "",
        semester: user.profile?.semester || "",
        location: user.profile?.location || "",
        bio: user.profile?.bio || "",
        skillsHave: user.skillsHave.map(us => us.skill.name),
        skillsNeed: user.skillsNeed.map(us => us.skill.name),
        github: user.profile?.github || "",
        linkedin: user.profile?.linkedin || "",
        portfolio: user.profile?.portfolio || "",
        experience,
        availability,
        profileCompleted: user.profile?.profileCompleted || false,
        createdAt: user.profile?.createdAt as any || new Date(),
        updatedAt: user.profile?.updatedAt as any || new Date(),
        fullName: user.profile?.fullName || "",
        avatarUrl: user.profile?.photo || "",
        skillsOffered: user.skillsHave.map(us => us.skill.name),
        skillsWanted: user.skillsNeed.map(us => us.skill.name),
        searchKeywords: [],
        rating: user.profile?.rating || 5.0,
        completedSwaps: user.profile?.completedSwaps || 0,
        isOnline: user.profile?.isOnline || false,
      };
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({ 
      success: true, 
      data: {
        items: formattedProfiles,
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
