"use client";

import { useCallback, useEffect, useState } from "react";
import { UserProfile } from "@/features/profiles/types/profile";
import { profileService } from "@/features/profiles/services/profileService";

export function useProfileById(uid: string | null, enabled = true) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(uid && enabled));
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    if (!uid) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await profileService.getProfile(uid);
    if (result.error) {
      setError(result.error.userMessage);
      setProfile(null);
    } else {
      setProfile(result.data);
    }

    setIsLoading(false);
  }, [enabled, uid]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return { profile, isLoading, error, reload: loadProfile };
}
