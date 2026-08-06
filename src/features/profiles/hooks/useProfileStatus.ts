"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { ROUTES } from "@/constants";
import { profileRoutingService } from "@/features/profiles/services/profileRoutingService";

interface UseProfileRedirectOptions {
  redirectWhenComplete?: boolean;
  redirectWhenIncomplete?: boolean;
}

export function useProfileRedirect(
  user: User | null,
  authLoading: boolean,
  options: UseProfileRedirectOptions = {}
) {
  const router = useRouter();
  const { redirectWhenComplete = false, redirectWhenIncomplete = false } = options;
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkProfile = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    setIsCheckingProfile(true);
    setError(null);

    const routeResult = await profileRoutingService.getRouteForUser(user);
    if (routeResult.error || !routeResult.data) {
      setError(routeResult.error?.userMessage || "Failed to check your profile.");
      setIsCheckingProfile(false);
      return;
    }

    setProfileCompleted(routeResult.data.profileCompleted);

    if (
      (routeResult.data.profileCompleted && redirectWhenComplete) ||
      (!routeResult.data.profileCompleted && redirectWhenIncomplete)
    ) {
      const targetRoute = profileRoutingService.getRouteForStatus(routeResult.data);
      router.replace(targetRoute);
    }

    setIsCheckingProfile(false);
  }, [authLoading, redirectWhenComplete, redirectWhenIncomplete, router, user]);

  useEffect(() => {
    void checkProfile();
  }, [checkProfile]);

  return { isCheckingProfile, profileCompleted, error };
}
