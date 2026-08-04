"use client";

import { useCallback, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { UserProfile } from "@/features/profiles/types/profile";
import { profileService } from "@/features/profiles/services/profileService";

export function useCurrentProfile(user: User | null, authLoading: boolean) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let profileResult = await profileService.getProfile(user.uid);
    if (profileResult.error) {
      setError(profileResult.error.userMessage);
      setIsLoading(false);
      return;
    }

    if (!profileResult.data) {
      const shellResult = await profileService.ensureProfileShell(user);
      if (shellResult.error) {
        setError(shellResult.error.userMessage);
        setIsLoading(false);
        return;
      }

      profileResult = await profileService.getProfile(user.uid);
      if (profileResult.error) {
        setError(profileResult.error.userMessage);
        setIsLoading(false);
        return;
      }
    }

    setProfile(profileResult.data);

    setIsLoading(false);
  }, [authLoading, user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return { profile, isLoading, error, reload: loadProfile };
}
