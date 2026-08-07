import "server-only";
import prisma from "@/lib/prisma";
import { User, Profile, Skill, UserSkill, UserSkillNeed, Project, ProjectMember, MatchRequest, Conversation, Message, Notification, SearchKeyword } from "@prisma/client";
import { generateSearchKeywords } from "@/utils";
import { handleServiceCall, ServiceResult } from "@/services/baseService";
import { CompleteProfileInput, MAX_PROFILE_SKILLS, UserProfile, ExperienceLevel, Availability } from "@/features/profiles/types/profile";
import { User as FirebaseUser } from "firebase/auth";

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

function profileFromPrisma(user: User & { profile?: Profile | null }, profile?: Profile): UserProfile {
  const profileData = profile || user.profile || {} as Profile;
  const experience: ExperienceLevel = (profileData.experience as ExperienceLevel) || "Beginner";
  const availability: Availability = (profileData.availability as Availability) || "Part Time";

  return {
    uid: user.id,
    firebaseUID: user.firebaseUid,
    name: profileData.fullName || "",
    username: profileData.username || "",
    banner: profileData.banner || "",
    email: user.email || "",
    photo: profileData.photo || "",
    university: profileData.university || "",
    department: profileData.department || "",
    semester: profileData.semester || "",
    location: profileData.location || "",
    bio: profileData.bio || "",
    skillsHave: [], // Will be populated from UserSkill
    skillsNeed: [], // Will be populated from UserSkillNeed
    github: profileData.github || "",
    linkedin: profileData.linkedin || "",
    portfolio: profileData.portfolio || "",
    experience,
    availability,
    profileCompleted: profileData.profileCompleted || false,
    createdAt: profileData.createdAt as any || new Date(),
    updatedAt: profileData.updatedAt as any || new Date(),
    fullName: profileData.fullName || "",
    avatarUrl: profileData.photo || "",
    skillsOffered: [],
    skillsWanted: [],
    searchKeywords: [],
    rating: profileData.rating || 5.0,
    completedSwaps: profileData.completedSwaps || 0,
    isOnline: profileData.isOnline || false,
  };
}

export const userService = {
  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { firebaseUid },
      include: { profile: true }
    });
  },

  async createFromFirebaseUser(user: FirebaseUser): Promise<User> {
    const name = user.displayName || user.email?.split("@")[0] || "SkillSwap Member";
    const email = user.email?.trim().toLowerCase() || "";

    return prisma.user.create({
      data: {
        firebaseUid: user.uid,
        email,
        profile: {
          create: {
            fullName: name,
            username: name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 10000),
            banner: "",
            university: "",
            department: "",
            semester: "",
            bio: "",
            photo: user.photoURL || "",
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
};

export const profileService = {
  async getProfile(uid: string): Promise<ServiceResult<UserProfile | null>> {
    return handleServiceCall(async () => {
      const user = await prisma.user.findUnique({
        where: { id: uid },
        include: {
          profile: true,
          skillsHave: { include: { skill: true } },
          skillsNeed: { include: { skill: true } }
        }
      });

      if (!user) return null;

      const profile = profileFromPrisma(user, user.profile || undefined);

      // Add skills
      profile.skillsHave = user.skillsHave.map(us => us.skill.name);
      profile.skillsNeed = user.skillsNeed.map(us => us.skill.name);
      profile.skillsOffered = profile.skillsHave;
      profile.skillsWanted = profile.skillsNeed;

      // Add search keywords
      const keywords = await prisma.searchKeyword.findMany({
        where: { userId: uid }
      });
      profile.searchKeywords = keywords.map(k => k.keyword);

      return profile;
    }, "Failed to load your profile.");
  },

  async ensureProfileShell(user: FirebaseUser): Promise<ServiceResult<void>> {
    return handleServiceCall(async () => {
      const existingUser = await userService.findByFirebaseUid(user.uid);

      if (existingUser) return;

      await userService.createFromFirebaseUser(user);
    }, "Failed to initialize your profile.");
  },

  async saveCompletedProfile(
    user: FirebaseUser,
    input: CompleteProfileInput
  ): Promise<ServiceResult<void>> {
    return handleServiceCall(async () => {
      const skillsHave = normalizeSkills(input.skillsHave);
      const skillsNeed = normalizeSkills(input.skillsNeed);
      const name = input.name.trim();
      const photo = cleanUrl(input.photo) || user.photoURL || "";

      // Find or create user
      let dbUser = await userService.findByFirebaseUid(user.uid);

      if (!dbUser) {
        dbUser = await userService.createFromFirebaseUser(user);
      }

      // Update profile
      await prisma.profile.upsert({
        where: { userId: dbUser.id },
        create: {
          userId: dbUser.id,
          fullName: name,
          username: name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 10000),
          banner: "",
          university: input.university.trim(),
          department: input.department.trim(),
          semester: input.semester.trim(),
          bio: input.bio.trim(),
          photo,
          location: input.location.trim(),
          availability: input.availability,
          experience: input.experience,
          github: cleanUrl(input.github),
          linkedin: cleanUrl(input.linkedin),
          portfolio: cleanUrl(input.portfolio),
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
          github: cleanUrl(input.github),
          linkedin: cleanUrl(input.linkedin),
          portfolio: cleanUrl(input.portfolio),
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
    }, "Failed to save your profile.");
  },

  async listCompletedProfiles(): Promise<ServiceResult<UserProfile[]>> {
    return handleServiceCall(async () => {
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
        const profile = profileFromPrisma(user, user.profile || undefined);
        profile.skillsHave = user.skillsHave.map(us => us.skill.name);
        profile.skillsNeed = user.skillsNeed.map(us => us.skill.name);
        profile.skillsOffered = profile.skillsHave;
        profile.skillsWanted = profile.skillsNeed;
        return profile;
      });
    }, "Failed to load the skill feed.");
  }
};

export const searchService = {
  async searchStudents(filters: any, pageSize = 15, cursor?: any): Promise<ServiceResult<any>> {
    return handleServiceCall(async () => {
      const where: any = {
        profile: { profileCompleted: true }
      };

      if (filters.skill && filters.skill.trim().length > 0) {
        where.skillsHave = {
          some: {
            skill: { name: { contains: filters.skill.trim(), mode: "insensitive" } }
          }
        };
      }
      else if (filters.department && filters.department.trim().length > 0) {
        where.profile = {
          ...where.profile,
          department: filters.department.trim()
        };
      }
      else if (filters.semester && filters.semester.trim().length > 0) {
        where.profile = {
          ...where.profile,
          semester: filters.semester.trim()
        };
      }
      else if (filters.searchTerm && filters.searchTerm.trim().length > 0) {
        const term = filters.searchTerm.trim().toLowerCase();
        where.OR = [
          { profile: { fullName: { contains: term, mode: "insensitive" } } },
          { searchKeywords: { some: { keyword: { contains: term, mode: "insensitive" } } } }
        ];
      }

      const users = await prisma.user.findMany({
        where,
        include: {
          profile: true,
          skillsHave: { include: { skill: true } },
          skillsNeed: { include: { skill: true } }
        },
        take: pageSize + 1,
        orderBy: {
          profile: { updatedAt: "desc" }
        }
      });

      const hasMore = users.length > pageSize;
      const resultUsers = hasMore ? users.slice(0, pageSize) : users;

      const profiles = resultUsers.map(user => {
        const profile = profileFromPrisma(user, user.profile || undefined);
        profile.skillsHave = user.skillsHave.map(us => us.skill.name);
        profile.skillsNeed = user.skillsNeed.map(us => us.skill.name);
        profile.skillsOffered = profile.skillsHave;
        profile.skillsWanted = profile.skillsNeed;
        return profile;
      });

      return {
        users: profiles,
        hasMore
      };
    }, "Failed to search student profiles.");
  }
};

export const projectService = {
  async getAll(): Promise<Project[]> {
    return prisma.project.findMany({
      include: {
        owner: true,
        members: { include: { user: true } }
      }
    });
  },

  async create(data: any, ownerId: string): Promise<string> {
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: "Owner"
          }
        }
      }
    });
    return project.id;
  }
};

export const connectionService = {
  async sendConnectionRequest({ requesterId, requesterName, requesterPhoto, recipientId }: any): Promise<ServiceResult<string>> {
    return handleServiceCall(async () => {
      if (requesterId === recipientId) {
        throw new Error("You cannot connect with yourself.");
      }

      // Check if connection already exists
      const existing = await prisma.matchRequest.findUnique({
        where: {
          senderId_receiverId: {
            senderId: requesterId,
            receiverId: recipientId
          }
        }
      });

      if (existing) {
        return "exists";
      }

      // Create match request
      await prisma.matchRequest.create({
        data: {
          senderId: requesterId,
          receiverId: recipientId,
          status: "pending"
        }
      });

      // Create notification
      await prisma.notification.create({
        data: {
          recipientId,
          senderId: requesterId,
          type: "connection_request",
          title: "New connection request",
          body: `${requesterName} wants to connect for a skill swap.`,
          linkUrl: `/profile/${requesterId}`
        }
      });

      return "created";
    }, "Failed to send connection request.");
  }
};

export const notificationService = {
  async subscribeToNotifications(userId: string, onData: (notifications: any[]) => void, onError?: (err: Error) => void) {
    // In a real app, you would use a real-time subscription
    // For now, we'll just fetch once
    const notifications = await prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    onData(notifications);

    // Return a no-op unsubscribe function
    return () => {};
  },

  async markAsRead(notificationId: string): Promise<ServiceResult<void>> {
    return handleServiceCall(async () => {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
      });
    }, "Failed to mark notification as read.");
  },

  async markAllAsRead(notifications: any[]): Promise<ServiceResult<void>> {
    return handleServiceCall(async () => {
      const unreadItems = notifications.filter((item) => !item.read);
      if (unreadItems.length === 0) return;

      await prisma.notification.updateMany({
        where: { id: { in: unreadItems.map(item => item.id) } },
        data: { read: true }
      });
    }, "Failed to mark all notifications as read.");
  }
};