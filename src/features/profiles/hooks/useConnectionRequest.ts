"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { connectionService } from "@/features/profiles/services/connectionService";
import { toast } from "sonner";

export function useConnectionRequest(user: User | null) {
  const [pendingRecipientId, setPendingRecipientId] = useState<string | null>(null);

  const sendConnectionRequest = async (recipientId: string) => {
    if (!user) return;

    setPendingRecipientId(recipientId);

    const result = await connectionService.sendConnectionRequest({
      recipientId,
    });

    setPendingRecipientId(null);

    if (result.error) {
      toast.error(result.error.userMessage);
      return;
    }

    if (result.data === "exists") {
      toast.warning("You already sent a connection request to this student.");
    } else {
      toast.success("Connection request sent successfully.");
    }
  };

  return { pendingRecipientId, sendConnectionRequest };
}
