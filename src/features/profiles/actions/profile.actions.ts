"use server";

import { getProfile, listCompletedProfiles } from "@/app/api/db/profile/utils";
import { UserProfile } from "@/features/profiles/types/profile";

export async function getProfileAction(uid: string): Promise<{ data?: UserProfile | null; error?: string }> {
  try {
    const profile = await getProfile(uid);
    return { data: profile };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to get profile" };
  }
}

export async function listCompletedProfilesAction(): Promise<{ data?: UserProfile[]; error?: string }> {
  try {
    const profiles = await listCompletedProfiles();
    return { data: profiles };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to list profiles" };
  }
}