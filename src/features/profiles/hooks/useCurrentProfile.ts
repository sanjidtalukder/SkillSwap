import { useCallback, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { UserProfile } from "@/features/profiles/types/profile";
import { getProfileAction } from "@/features/profiles/actions/profile.actions";
import { fetchWithAuth } from "@/lib/api-client";

export function useCurrentProfile(user: User | null, authLoading: boolean) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user || authLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getProfileAction(user.uid);
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
  }, [user, authLoading]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const ensureProfile = useCallback(async () => {
    if (!user) return { error: "No user authenticated" };

    try {
      const response = await fetchWithAuth("/api/db/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName || user.email?.split("@")[0] || "SkillSwap Member"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || "Failed to ensure profile" };
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to ensure profile" };
    }
  }, [user]);

  return { profile, isLoading, error, refetch: fetchProfile, ensureProfile };
}