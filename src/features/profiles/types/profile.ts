import { Timestamp } from "firebase/firestore";

export const MAX_PROFILE_SKILLS = 20;

export const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;
export const AVAILABILITY_OPTIONS = ["Full Time", "Part Time", "Weekends"] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type Availability = (typeof AVAILABILITY_OPTIONS)[number];

export interface UserProfile {
  uid: string;
  firebaseUID: string;
  name: string;
  email: string;
  photo?: string;
  university: string;
  department: string;
  semester: string;
  location: string;
  bio: string;
  skillsHave: string[];
  skillsNeed: string[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  experience: ExperienceLevel;
  availability: Availability;
  profileCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  fullName: string;
  avatarUrl?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  searchKeywords: string[];
  rating: number;
  completedSwaps: number;
  isOnline: boolean;
}

export interface CompleteProfileInput {
  name: string;
  photo?: string;
  university: string;
  department: string;
  semester: string;
  location: string;
  bio: string;
  skillsHave: string[];
  skillsNeed: string[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  experience: ExperienceLevel;
  availability: Availability;
}
