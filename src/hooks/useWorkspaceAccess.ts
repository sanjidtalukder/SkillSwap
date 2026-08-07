"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api-client";

export function useWorkspaceAccess() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  const openWorkspace = async (projectId: string) => {
    if (isVerifying) return;
    
    setIsVerifying(true);
    try {
      const res = await fetchWithAuth(`/api/workspace/${projectId}/access`);
      
      if (!res.ok) {
        toast.error("You must be logged in to access workspaces.");
        router.push("/login");
        return;
      }
      
      const data = await res.json();
      
      if (data.hasAccess) {
        router.push(`/workspace/${projectId}`);
      } else if (data.status === "pending") {
        toast.error("Your join request is still pending.");
      } else {
        toast.error("You must join this project before accessing its workspace.");
      }
    } catch (err) {
      toast.error("Failed to verify workspace access.");
    } finally {
      setIsVerifying(false);
    }
  };

  return { openWorkspace, isVerifying };
}
