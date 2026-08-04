import { db, storage } from "@/firebase";
import { handleServiceCall, ServiceResult } from "@/services/baseService";
import { generateSearchKeywords } from "@/utils";
import {
  CompleteProfileInput,
  MAX_PROFILE_SKILLS,
  UserProfile,
} from "@/features/profiles/types/profile";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { User } from "firebase/auth";

const USERS_COLLECTION = "users";
const FEED_LIMIT = 60;

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

function profileFromDoc(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid,
    firebaseUID: String(data.firebaseUID || data.uid || uid),
    name: String(data.name || data.fullName || ""),
    email: String(data.email || ""),
    photo: String(data.photo || data.avatarUrl || ""),
    university: String(data.university || ""),
    department: String(data.department || ""),
    semester: String(data.semester || ""),
    location: String(data.location || ""),
    bio: String(data.bio || ""),
    skillsHave: Array.isArray(data.skillsHave)
      ? (data.skillsHave as string[])
      : ((data.skillsOffered as string[] | undefined) ?? []),
    skillsNeed: Array.isArray(data.skillsNeed)
      ? (data.skillsNeed as string[])
      : ((data.skillsWanted as string[] | undefined) ?? []),
    github: String(data.github || ""),
    linkedin: String(data.linkedin || ""),
    portfolio: String(data.portfolio || ""),
    experience: (data.experience as UserProfile["experience"]) || "Beginner",
    availability: (data.availability as UserProfile["availability"]) || "Part Time",
    profileCompleted: Boolean(data.profileCompleted),
    createdAt: data.createdAt as UserProfile["createdAt"],
    updatedAt: data.updatedAt as UserProfile["updatedAt"],
    fullName: String(data.fullName || data.name || ""),
    avatarUrl: String(data.avatarUrl || data.photo || ""),
    skillsOffered:
      (data.skillsOffered as string[] | undefined) ??
      (data.skillsHave as string[] | undefined) ??
      [],
    skillsWanted:
      (data.skillsWanted as string[] | undefined) ??
      (data.skillsNeed as string[] | undefined) ??
      [],
    searchKeywords: (data.searchKeywords as string[] | undefined) ?? [],
    rating: Number(data.rating ?? 5),
    completedSwaps: Number(data.completedSwaps ?? 0),
    isOnline: Boolean(data.isOnline ?? false),
  };
}

export const profileService = {
  async getProfile(uid: string): Promise<ServiceResult<UserProfile | null>> {
    return handleServiceCall(async () => {
      const profileDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
      if (!profileDoc.exists()) return null;

      return profileFromDoc(profileDoc.id, profileDoc.data());
    }, "Failed to load your profile.");
  },

  async ensureProfileShell(user: User): Promise<ServiceResult<void>> {
    return handleServiceCall(async () => {
      const profileRef = doc(db, USERS_COLLECTION, user.uid);
      const existing = await getDoc(profileRef);
      if (existing.exists()) return;

      const name = user.displayName || user.email?.split("@")[0] || "SkillSwap Member";
      const email = user.email?.trim().toLowerCase() || "";

      await setDoc(profileRef, {
        uid: user.uid,
        firebaseUID: user.uid,
        email,
        fullName: name,
        name,
        photo: user.photoURL || "",
        avatarUrl: user.photoURL || "",
        university: "",
        department: "",
        semester: "",
        location: "",
        bio: "",
        skillsHave: [],
        skillsNeed: [],
        skillsOffered: [],
        skillsWanted: [],
        github: "",
        linkedin: "",
        portfolio: "",
        experience: "Beginner",
        availability: "Part Time",
        profileCompleted: false,
        searchKeywords: generateSearchKeywords(name, [], [], "", ""),
        rating: 5.0,
        completedSwaps: 0,
        isOnline: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }, "Failed to initialize your profile.");
  },

  async saveCompletedProfile(
    user: User,
    input: CompleteProfileInput
  ): Promise<ServiceResult<void>> {
    return handleServiceCall(async () => {
      const skillsHave = normalizeSkills(input.skillsHave);
      const skillsNeed = normalizeSkills(input.skillsNeed);
      const name = input.name.trim();
      const photo = cleanUrl(input.photo) || user.photoURL || "";
      const profileRef = doc(db, USERS_COLLECTION, user.uid);
      const existingProfile = await getDoc(profileRef);
      const existingData = existingProfile.exists() ? existingProfile.data() : null;

      await setDoc(
        profileRef,
        {
          uid: existingData?.uid || user.uid,
          firebaseUID: existingData?.firebaseUID || user.uid,
          email: existingData?.email || user.email?.trim().toLowerCase() || "",
          fullName: name,
          name,
          photo,
          avatarUrl: photo,
          university: input.university.trim(),
          department: input.department.trim(),
          semester: input.semester.trim(),
          location: input.location.trim(),
          bio: input.bio.trim(),
          skillsHave,
          skillsNeed,
          skillsOffered: skillsHave,
          skillsWanted: skillsNeed,
          github: cleanUrl(input.github),
          linkedin: cleanUrl(input.linkedin),
          portfolio: cleanUrl(input.portfolio),
          experience: input.experience,
          availability: input.availability,
          profileCompleted: true,
          searchKeywords: generateSearchKeywords(
            name,
            skillsHave,
            skillsNeed,
            input.department,
            input.semester
          ),
          isOnline: true,
          updatedAt: serverTimestamp(),
          ...(existingProfile.exists()
            ? {}
            : {
                rating: 5.0,
                completedSwaps: 0,
                createdAt: serverTimestamp(),
              }),
        },
        { merge: true }
      );
    }, "Failed to save your profile.");
  },

  async uploadProfilePhoto(uid: string, file: File): Promise<ServiceResult<string>> {
    return handleServiceCall(async () => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const avatarRef = ref(storage, `avatars/${uid}/profile.${extension}`);
      await uploadBytes(avatarRef, file, { contentType: file.type });
      return getDownloadURL(avatarRef);
    }, "Failed to upload profile picture.");
  },

  async listCompletedProfiles(): Promise<ServiceResult<UserProfile[]>> {
    return handleServiceCall(async () => {
      const feedQuery = query(
        collection(db, USERS_COLLECTION),
        where("profileCompleted", "==", true),
        orderBy("updatedAt", "desc"),
        limit(FEED_LIMIT)
      );
      const snapshot = await getDocs(feedQuery);

      return snapshot.docs.map((profileDoc) => profileFromDoc(profileDoc.id, profileDoc.data()));
    }, "Failed to load the skill feed.");
  },
};
