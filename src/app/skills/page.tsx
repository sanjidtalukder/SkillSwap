"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { fetchWithAuth } from "@/lib/api-client";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProfileCard } from "@/features/profiles/components/ProfileCard";
import { useConnectionRequest } from "@/features/profiles/hooks/useConnectionRequest";
import { toast } from "sonner";
import { ConnectionDialog } from "@/components/common/ConnectionDialog";
import { Pagination } from "@/components/ui/Pagination";
import { UserProfile } from "@/features/profiles/types/profile";

interface PaginationData {
  items: UserProfile[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function SkillsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [startingChatId, setStartingChatId] = useState<string | null>(null);
  
  const initialPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  
  const [paginationData, setPaginationData] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 10;

  const updateUrl = useCallback((newPage: number) => {
    const query = new URLSearchParams();
    if (newPage > 1) query.set("page", newPage.toString());
    
    router.push(`${pathname}?${query.toString()}`, { scroll: false });
  }, [pathname, router]);

  const fetchSkills = useCallback(async (pageToFetch: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      query.set("page", pageToFetch.toString());
      query.set("limit", limit.toString());

      const response = await fetchWithAuth(`/api/skills?${query.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load skills");
      }
      const data = await response.json();
      setPaginationData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch skills");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      void fetchSkills(initialPage);
    }
  }, [authLoading, fetchSkills, initialPage]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStatus, setDialogStatus] = useState<"not_connected" | "pending">("not_connected");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {
    pendingRecipientId,
    sendConnectionRequest,
  } = useConnectionRequest(user);

  const rawProfiles = paginationData?.items || [];
  const visibleProfiles = useMemo(
    () => (user ? rawProfiles.filter((profile) => profile.uid !== user.uid) : rawProfiles),
    [rawProfiles, user]
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

  const handlePageChange = (newPage: number) => {
    updateUrl(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <Header />
      <main className="container relative z-10 mx-auto flex-1 p-6 md:p-10 space-y-8">
        <div className="space-y-2 border-b border-border/70 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Connect & Learn
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Skills Directory
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-muted-foreground">
            Browse through all registered students and their skills. Connect with them for a skill swap!
          </p>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {isLoading || authLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton count={limit} />
          </div>
        ) : rawProfiles.length > 0 ? (
          <div className="space-y-6">
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

            {paginationData && paginationData.totalPages > 1 && (
              <Pagination
                currentPage={paginationData.currentPage}
                totalPages={paginationData.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        ) : (
          <EmptyState
            title="No completed profiles yet"
            description="Completed student profiles will appear here."
            actionLabel="Refresh Directory"
            onAction={() => {
              updateUrl(1);
            }}
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
