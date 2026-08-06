import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { generateSearchKeywords } from "@/utils";
import { MAX_PROFILE_SKILLS, UserProfile, ExperienceLevel, Availability } from "@/features/profiles/types/profile";

function cleanUrl(value?: string) {
  return value?.trim() || "";
}

function normalizeSkills(skills: string[]) {
  const seen = new Set<string>();

  return skills
    .map((skill) => skill.trim())
    .filter(Boolean)
    .filter((skill) => {
      const key = skill.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_PROFILE_SKILLS);
}

export async function ensureProfileShell(firebaseUid: string, email: string, name: string) {
  const existingUser = await prisma.user.findUnique({
    where: { firebaseUid }
  });

  if (existingUser) return existingUser;

  return await prisma.user.create({
    data: {
      firebaseUid,
      email,
      profile: {
        create: {
          fullName: name,
          university: "",
          department: "",
          semester: "",
          bio: "",
          photo: "",
          location: "",
          availability: "Part Time",
          experience: "Beginner",
          profileCompleted: false,
          rating: 5.0,
          completedSwaps: 0,
          isOnline: true,
          searchKeywords: "",
        }
      }
    },
    include: { profile: true }
  });
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: {
      profile: true,
      skillsHave: { include: { skill: true } },
      skillsNeed: { include: { skill: true } }
    }
  });

  if (!user) return null;

  const experience: ExperienceLevel = (user.profile?.experience as ExperienceLevel) || "Beginner";
  const availability: Availability = (user.profile?.availability as Availability) || "Part Time";

  const profile: UserProfile = {
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

  // Add search keywords
  const keywords = await prisma.searchKeyword.findMany({
    where: { userId: uid }
  });
  profile.searchKeywords = keywords.map(k => k.keyword);

  return profile;
}

export async function saveCompletedProfile(firebaseUid: string, input: any) {
  const skillsHave = normalizeSkills(input.skillsHave);
  const skillsNeed = normalizeSkills(input.skillsNeed);
  const name = input.name.trim();
  const photo = cleanUrl(input.photo) || "";

  // Find user
  const dbUser = await prisma.user.findUnique({
    where: { firebaseUid }
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  // Update profile
  await prisma.profile.upsert({
    where: { userId: dbUser.id },
    create: {
      userId: dbUser.id,
      fullName: name,
      university: input.university.trim(),
      department: input.department.trim(),
      semester: input.semester.trim(),
      bio: input.bio.trim(),
      photo,
      location: input.location.trim(),
      availability: input.availability,
      experience: input.experience,
      profileCompleted: true,
      rating: 5.0,
      completedSwaps: 0,
      isOnline: true,
      searchKeywords: "",
    },
    update: {
      fullName: name,
      university: input.university.trim(),
      department: input.department.trim(),
      semester: input.semester.trim(),
      bio: input.bio.trim(),
      photo,
      location: input.location.trim(),
      availability: input.availability,
      experience: input.experience,
      profileCompleted: true,
    }
  });

  // Update skills (have)
  await prisma.userSkill.deleteMany({
    where: { userId: dbUser.id }
  });

  for (const skillName of skillsHave) {
    // Find or create skill
    const skill = await prisma.skill.upsert({
      where: { name: skillName },
      create: { name: skillName },
      update: {}
    });

    await prisma.userSkill.create({
      data: {
        userId: dbUser.id,
        skillId: skill.id,
        level: "Intermediate" // Default level
      }
    });
  }

  // Update skills (need)
  await prisma.userSkillNeed.deleteMany({
    where: { userId: dbUser.id }
  });

  for (const skillName of skillsNeed) {
    // Find or create skill
    const skill = await prisma.skill.upsert({
      where: { name: skillName },
      create: { name: skillName },
      update: {}
    });

    await prisma.userSkillNeed.create({
      data: {
        userId: dbUser.id,
        skillId: skill.id
      }
    });
  }

  // Update search keywords
  await prisma.searchKeyword.deleteMany({
    where: { userId: dbUser.id }
  });

  const keywords = generateSearchKeywords(
    name,
    skillsHave,
    skillsNeed,
    input.department,
    input.semester
  );

  for (const keyword of keywords) {
    await prisma.searchKeyword.create({
      data: {
        userId: dbUser.id,
        keyword
      }
    });
  }
}

export async function listCompletedProfiles(): Promise<UserProfile[]> {
  const users = await prisma.user.findMany({
    where: {
      profile: {
        profileCompleted: true
      }
    },
    include: {
      profile: true,
      skillsHave: { include: { skill: true } },
      skillsNeed: { include: { skill: true } }
    },
    orderBy: {
      profile: { updatedAt: "desc" }
    }
  });

  return users.map(user => {
    const experience: ExperienceLevel = (user.profile?.experience as ExperienceLevel) || "Beginner";
    const availability: Availability = (user.profile?.availability as Availability) || "Part Time";

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
}