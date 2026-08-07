"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { fetchWithAuth } from "@/lib/api-client";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProfileCard } from "@/features/profiles/components/ProfileCard";
import { useConnectionRequest } from "@/features/profiles/hooks/useConnectionRequest";
import { useCompletedProfiles } from "@/features/profiles/hooks/useCompletedProfiles";

export default function SkillsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [startingChatId, setStartingChatId] = useState<string | null>(null);
  
  // Fetch all completed profiles
  const { profiles, isLoading, error, reload } = useCompletedProfiles(true);
  
  const {
    notice: connectNotice,
    error: connectError,
    pendingRecipientId,
    sendConnectionRequest,
  } = useConnectionRequest(user);

  const visibleProfiles = useMemo(
    () => (user ? profiles.filter((profile) => profile.uid !== user.uid) : profiles),
    [profiles, user]
  );

  const handleStartChat = async (uid: string) => {
    if (startingChatId) return;
    setStartingChatId(uid);
    try {
      const response = await fetchWithAuth("/api/chat/conversations", {
        method: "POST",
        body: JSON.stringify({ targetUserId: uid })
      });
      const res = await response.json();
      if (res.success) {
        router.push(`/chat/${res.data.id}`);
      } else {
        alert(res.error || "Failed to start chat");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to start chat");
    } finally {
      setStartingChatId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-6xl flex-1 space-y-8 p-6 md:p-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Skills Directory
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Browse through all registered students and their skills. Connect with them for a skill swap!
          </p>
        </div>

        {(error || connectError) && (
          <Alert variant="error">{error || connectError}</Alert>
        )}
        {connectNotice && <Alert variant="success">{connectNotice}</Alert>}

        {isLoading || authLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton count={6} />
          </div>
        ) : visibleProfiles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProfiles.map((profile) => (
              <ProfileCard
                key={profile.uid}
                profile={profile}
                onConnect={sendConnectionRequest}
                onMessage={handleStartChat}
                isConnecting={pendingRecipientId === profile.uid || startingChatId === profile.uid}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No completed profiles yet"
            description="Completed student profiles will appear here."
            actionLabel="Refresh Directory"
            onAction={reload}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
