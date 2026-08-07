"use client";

import { useParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { ProfileCard } from "@/features/profiles/components/ProfileCard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProfileById } from "@/features/profiles/hooks/useProfileById";
import { useProfileRedirect } from "@/features/profiles/hooks/useProfileStatus";
import { useConnectionStatus } from "@/features/profiles/hooks/useConnectionStatus";
import { ExternalLink, MessageCircle, UserPlus, Clock, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api-client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function ProfileDetailPage() {
  const params = useParams<{ uid: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [startingChat, setStartingChat] = useState(false);
  const {
    isCheckingProfile,
    profileCompleted,
    error: authProfileError,
  } = useProfileRedirect(user, authLoading, {
    redirectWhenIncomplete: true,
  });
  const { profile, isLoading, error, reload } = useProfileById(
    params.uid,
    Boolean(user) && !authLoading
  );

  const {
    status: connectionStatus,
    conversationId,
    sendRequest,
    acceptRequest,
    rejectRequest,
  } = useConnectionStatus(profile?.uid);

  const isBusy = authLoading || isCheckingProfile || profileCompleted !== true || isLoading;

  const handleStartChat = async () => {
    if (!profile?.uid || startingChat) return;
    setStartingChat(true);
    try {
      const response = await fetchWithAuth("/api/chat/conversations", {
        method: "POST",
        body: JSON.stringify({ targetUserId: profile.uid })
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
      setStartingChat(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-4xl flex-1 space-y-6 p-6 md:p-10">
        {(authProfileError || error) && <Alert variant="error">{authProfileError || error}</Alert>}

        {isBusy ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : profile?.profileCompleted ? (
          <div className="space-y-6">
            <ProfileCard profile={profile} showActions={false} />
            <div className="grid gap-3 rounded-xl border border-border/60 bg-card/50 p-5 sm:grid-cols-3">
              {profile.github && <ProfileLink label="Github" href={profile.github} />}
              {profile.linkedin && <ProfileLink label="LinkedIn" href={profile.linkedin} />}
              {profile.portfolio && <ProfileLink label="Portfolio" href={profile.portfolio} />}
            </div>
            
            {user?.uid !== profile.firebaseUID && (
              <div className="flex justify-end mt-4 gap-2">
                {connectionStatus === "LOADING" && (
                  <Button disabled>
                    <Spinner size="sm" className="mr-2" />
                    Loading...
                  </Button>
                )}
                {connectionStatus === "NOT_CONNECTED" && (
                  <Button onClick={sendRequest} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                )}
                {connectionStatus === "PENDING_SENT" && (
                  <Button disabled className="bg-yellow-500 text-white opacity-70">
                    <Clock className="w-4 h-4 mr-2" />
                    Request Sent
                  </Button>
                )}
                {connectionStatus === "PENDING_RECEIVED" && (
                  <>
                    <Button onClick={acceptRequest} className="bg-green-600 hover:bg-green-700 text-white">
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button onClick={rejectRequest} variant="destructive">
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                {connectionStatus === "ACCEPTED" && conversationId && (
                  <Button onClick={() => router.push(`/chat/${conversationId}`)}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Open Chat
                  </Button>
                )}
                {connectionStatus === "ACCEPTED" && !conversationId && (
                  <Button onClick={handleStartChat} disabled={startingChat}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {startingChat ? "Starting chat..." : "Message"}
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title="Profile not available"
            description="This profile is missing or has not been completed yet."
            actionLabel="Retry"
            onAction={reload}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

function ProfileLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border/80 bg-background/50 px-4 text-sm font-medium transition-all duration-150 hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <ExternalLink className="h-4 w-4" />
      {label}
    </a>
  );
}
