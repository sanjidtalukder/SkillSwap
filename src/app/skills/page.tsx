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
