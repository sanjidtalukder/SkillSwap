"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { connectionService } from "@/features/profiles/services/connectionService";

export function useConnectionRequest(user: User | null) {
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingRecipientId, setPendingRecipientId] = useState<string | null>(null);

  const sendConnectionRequest = async (recipientId: string) => {
    if (!user) return;

    setNotice(null);
    setError(null);
    setPendingRecipientId(recipientId);

    const result = await connectionService.sendConnectionRequest({
      recipientId,
    });

    setPendingRecipientId(null);

    if (result.error) {
      setError(result.error.userMessage);
      return;
    }

    setNotice(
      result.data === "exists"
        ? "You already sent a connection request to this student."
        : "Connection request sent."
    );
  };

  return { notice, error, pendingRecipientId, sendConnectionRequest };
}
