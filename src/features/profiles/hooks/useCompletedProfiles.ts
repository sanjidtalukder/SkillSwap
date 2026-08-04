"use client";

import { useCallback, useEffect, useState } from "react";
import { UserProfile } from "@/features/profiles/types/profile";
import { profileService } from "@/features/profiles/services/profileService";

export function useCompletedProfiles(enabled = true) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await profileService.listCompletedProfiles();
    if (result.error) {
      setError(result.error.userMessage);
      setProfiles([]);
    } else {
      setProfiles(result.data ?? []);
    }

    setIsLoading(false);
  }, [enabled]);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  return { profiles, isLoading, error, reload: loadProfiles };
}
