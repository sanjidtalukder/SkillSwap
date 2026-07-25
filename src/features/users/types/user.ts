export interface StudentProfile {
  uid: string;
  fullName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  createdAt: string;
}
