import { useCallback, useEffect, useState } from "react";
import { UserProfile } from "@/features/profiles/types/profile";
import { listCompletedProfilesAction } from "@/features/profiles/actions/profile.actions";

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

    try {
      const result = await listCompletedProfilesAction();
      if (result.error) {
        setError(result.error);
        setProfiles([]);
      } else {
        setProfiles(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profiles");
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  return { profiles, isLoading, error, reload: loadProfiles };
}