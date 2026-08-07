"use server";

import { getProfile, listCompletedProfiles } from "@/app/api/db/profile/utils";
import { UserProfile } from "@/features/profiles/types/profile";
import { unstable_cache } from "next/cache";

const getCachedProfile = unstable_cache(
  async (uid: string) => getProfile(uid),
  ["profile"],
  { revalidate: 60 }
);

const getCachedCompletedProfiles = (limit?: number) => unstable_cache(
  async () => listCompletedProfiles({ limit }),
  [`completed-profiles-${limit || 'all'}`],
  { revalidate: 60 }
)();

export async function getProfileAction(uid: string): Promise<{ data?: UserProfile | null; error?: string }> {
  try {
    const profile = await getCachedProfile(uid);
    return { data: profile };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to get profile" };
  }
}

export async function listCompletedProfilesAction(limit?: number): Promise<{ data?: UserProfile[]; error?: string }> {
  try {
    const profiles = await getCachedCompletedProfiles(limit);
    return { data: profiles };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to list profiles" };
  }
}