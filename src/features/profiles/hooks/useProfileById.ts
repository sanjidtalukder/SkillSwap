import { useCallback, useEffect, useState } from "react";
import { UserProfile } from "@/features/profiles/types/profile";
import { getProfileAction } from "@/features/profiles/actions/profile.actions";

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

    try {
      const result = await getProfileAction(uid);
      if (result.error) {
        setError(result.error);
        setProfile(null);
      } else {
        setProfile(result.data || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, uid]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return { profile, isLoading, error, reload: loadProfile };
}