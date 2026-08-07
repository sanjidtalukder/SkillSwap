import { useState, useEffect, useCallback } from "react";
import { connectionService } from "../services/connectionService";
import { useAuth } from "@/features/auth/hooks/useAuth";

export type ConnectionStatus = "NOT_CONNECTED" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "REJECTED" | "LOADING" | "ERROR";

export function useConnectionStatus(targetUserId?: string) {
  const { user } = useAuth();
  const [status, setStatus] = useState<ConnectionStatus>("LOADING");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!targetUserId || !user) {
      setStatus("LOADING");
      return;
    }
    
    // Quick check if target is the user
    if (targetUserId === user.uid) {
      setStatus("NOT_CONNECTED");
      return;
    }

    try {
      const res = await connectionService.getConnectionStatus(targetUserId);
      if (res.error) {
        setError(res.error.userMessage);
        setStatus("ERROR");
      } else if (res.data) {
        setStatus(res.data.status as ConnectionStatus);
        if (res.data.conversationId) {
          setConversationId(res.data.conversationId);
        }
      }
    } catch (e) {
      setError("Failed to fetch connection status");
      setStatus("ERROR");
    }
  }, [targetUserId, user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const sendRequest = async () => {
    if (!targetUserId) return;
    setStatus("PENDING_SENT"); // Optimistic
    const res = await connectionService.sendConnectionRequest({ recipientId: targetUserId });
    if (res.error) {
      setError(res.error.userMessage);
      fetchStatus(); // Revert on error
    }
  };

  const acceptRequest = async () => {
    if (!targetUserId) return;
    setStatus("ACCEPTED"); // Optimistic
    const res = await connectionService.updateConnectionStatus(targetUserId, "accept");
    if (res.error) {
      setError(res.error.userMessage);
      fetchStatus();
    }
  };

  const rejectRequest = async () => {
    if (!targetUserId) return;
    setStatus("REJECTED"); // Optimistic
    const res = await connectionService.updateConnectionStatus(targetUserId, "reject");
    if (res.error) {
      setError(res.error.userMessage);
      fetchStatus();
    }
  };

  return {
    status,
    conversationId,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
    refresh: fetchStatus
  };
}
