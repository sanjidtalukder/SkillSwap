"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useProfileById } from "@/features/profiles/hooks/useProfileById";
import { ROUTES } from "@/constants";

export default function LegacyProfileRedirectPage() {
  const params = useParams<{ uid: string }>();
  const router = useRouter();
  const { profile, isLoading, error } = useProfileById(params.uid, true);

  useEffect(() => {
    if (!isLoading) {
      if (profile?.username) {
        router.replace(`/u/${profile.username}`);
      } else {
        // If we can't find them, or they have no username, go to dashboard
        router.replace(ROUTES.DASHBOARD);
      }
    }
  }, [profile, isLoading, error, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground animate-pulse">Locating profile...</p>
      </div>
    </div>
  );
}
