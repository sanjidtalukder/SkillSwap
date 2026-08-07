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
import { toast } from "sonner";
import { ConnectionDialog } from "@/components/common/ConnectionDialog";

export default function SkillsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [startingChatId, setStartingChatId] = useState<string | null>(null);
  
  // Fetch all completed profiles
  const { profiles, isLoading, error, reload } = useCompletedProfiles(true);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStatus, setDialogStatus] = useState<"not_connected" | "pending">("not_connected");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {
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
        if (res.connectionStatus === "not_connected" || res.connectionStatus === "pending") {
          setDialogStatus(res.connectionStatus);
          setSelectedUserId(uid);
          setDialogOpen(true);
        } else {
          toast.error(res.error || "Failed to start chat");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to start chat");
    } finally {
      setStartingChatId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto flex-1 p-6 md:p-10">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Skills Directory
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Browse through all registered students and their skills. Connect with them for a skill swap!
          </p>
        </div>

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
      
      {selectedUserId && (
        <ConnectionDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          status={dialogStatus}
          onSendRequest={async () => {
            await sendConnectionRequest(selectedUserId);
          }}
        />
      )}
    </div>
  );
}
