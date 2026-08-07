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

async function generateUniqueUsername(fullName: string): Promise<string> {
  const base = fullName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || "user";
  let username = base;
  let counter = 1;
  while (true) {
    const exists = await prisma.profile.findUnique({ where: { username } });
    if (!exists) return username;
    counter++;
    username = `${base}-${counter}`;
  }
}

export async function ensureProfileShell(firebaseUid: string, email: string, name: string) {
  const existingUser = await prisma.user.findUnique({
    where: { firebaseUid }
  });

  if (existingUser) return existingUser;

  const username = await generateUniqueUsername(name);

  return await prisma.user.create({
    data: {
      firebaseUid,
      email,
      profile: {
        create: {
          fullName: name,
          username,
          banner: "",
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
  const user = await prisma.user.findFirst({
    where: { OR: [{ firebaseUid: uid }, { id: uid }] },
    include: {
      profile: true,
      skillsHave: { include: { skill: true } },
      skillsNeed: { include: { skill: true } },
      keywords: true,
    }
  });

  if (!user) return null;

  const experience: ExperienceLevel = (user.profile?.experience as ExperienceLevel) || "Beginner";
  const availability: Availability = (user.profile?.availability as Availability) || "Part Time";

  const profile: UserProfile = {
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

  // Add search keywords
  profile.searchKeywords = user.keywords.map(k => k.keyword);

  return profile;
}

export async function getProfileByUsername(username: string): Promise<(UserProfile & { ownedProjects: any[] }) | null> {
  const profileRecord = await prisma.profile.findFirst({
    where: {
      OR: [
        { username: username },
        { userId: username },
        { user: { firebaseUid: username } }
      ]
    },
    include: {
      user: {
        include: {
          skillsHave: { include: { skill: true } },
          skillsNeed: { include: { skill: true } },
          keywords: true,
          ownedProjects: {
            select: {
              id: true,
              title: true,
              status: true,
              description: true,
              technologies: true,
              createdAt: true,
              members: {
                select: { id: true }
              }
            },
            orderBy: { createdAt: "desc" }
          }
        }
      }
    }
  });

  if (!profileRecord || !profileRecord.user) return null;

  const user = profileRecord.user;
  const experience: ExperienceLevel = (profileRecord.experience as ExperienceLevel) || "Beginner";
  const availability: Availability = (profileRecord.availability as Availability) || "Part Time";

  const profile: UserProfile & { ownedProjects: any[] } = {
    uid: user.id,
    firebaseUID: user.firebaseUid,
    name: profileRecord.fullName || "",
    username: profileRecord.username || "",
    banner: profileRecord.banner || "",
    email: user.email || "",
    photo: profileRecord.photo || "",
    university: profileRecord.university || "",
    department: profileRecord.department || "",
    semester: profileRecord.semester || "",
    location: profileRecord.location || "",
    bio: profileRecord.bio || "",
    skillsHave: user.skillsHave.map(us => us.skill.name),
    skillsNeed: user.skillsNeed.map(us => us.skill.name),
    github: profileRecord.github || "",
    linkedin: profileRecord.linkedin || "",
    portfolio: profileRecord.portfolio || "",
    experience,
    availability,
    profileCompleted: profileRecord.profileCompleted || false,
    createdAt: profileRecord.createdAt as any || new Date(),
    updatedAt: profileRecord.updatedAt as any || new Date(),
    fullName: profileRecord.fullName || "",
    avatarUrl: profileRecord.photo || "",
    skillsOffered: user.skillsHave.map(us => us.skill.name),
    skillsWanted: user.skillsNeed.map(us => us.skill.name),
    searchKeywords: user.keywords.map(k => k.keyword),
    rating: profileRecord.rating || 5.0,
    completedSwaps: profileRecord.completedSwaps || 0,
    isOnline: profileRecord.isOnline || false,
    ownedProjects: user.ownedProjects,
  };

  return profile;
}

export async function saveCompletedProfile(firebaseUid: string, input: any) {
  const skillsHave = normalizeSkills(input.skillsHave);
  const skillsNeed = normalizeSkills(input.skillsNeed);
  const name = input.name.trim();
  const photo = cleanUrl(input.photo) || "";
  const banner = cleanUrl(input.banner) || "";

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
      username: await generateUniqueUsername(name),
      university: input.university.trim(),
      department: input.department.trim(),
      semester: input.semester.trim(),
      bio: input.bio.trim(),
      photo,
      banner,
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
      banner,
      location: input.location.trim(),
      availability: input.availability,
      experience: input.experience,
      profileCompleted: true,
    }
  });

  // 1. Bulk ensure all skills exist
  const allSkillNames = Array.from(new Set([...skillsHave, ...skillsNeed]));
  
  // This loop is fine if we use upsert, but we can parallelize it:
  await Promise.all(
    allSkillNames.map(skillName => 
      prisma.skill.upsert({
        where: { name: skillName },
        create: { name: skillName },
        update: {}
      })
    )
  );

  // Get the IDs of the newly ensured skills
  const dbSkills = await prisma.skill.findMany({
    where: { name: { in: allSkillNames } },
    select: { id: true, name: true }
  });

  const skillNameToId = new Map(dbSkills.map(s => [s.name, s.id]));

  // 2 & 3. Transactional Delete and Bulk Insert
  await prisma.$transaction([
    prisma.userSkill.deleteMany({ where: { userId: dbUser.id } }),
    ...(skillsHave.length > 0 ? [
      prisma.userSkill.createMany({
        data: skillsHave.map(skillName => ({
          userId: dbUser.id,
          skillId: skillNameToId.get(skillName)!,
          level: "Intermediate"
        })),
        skipDuplicates: true
      })
    ] : []),
    prisma.userSkillNeed.deleteMany({ where: { userId: dbUser.id } }),
    ...(skillsNeed.length > 0 ? [
      prisma.userSkillNeed.createMany({
        data: skillsNeed.map(skillName => ({
          userId: dbUser.id,
          skillId: skillNameToId.get(skillName)!
        })),
        skipDuplicates: true
      })
    ] : [])
  ]);

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

export async function listCompletedProfiles({ limit, skip }: { limit?: number, skip?: number } = {}): Promise<UserProfile[]> {
  const users = await prisma.user.findMany({
    where: {
      profile: {
        profileCompleted: true
      }
    },
    take: limit,
    skip: skip,
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
  });

  return users.map(user => {
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
}