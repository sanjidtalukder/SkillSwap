/**
 * Client-safe connectionService.
 * All DB operations go through API routes — NO Prisma, NO server imports.
 */
import { ServiceResult } from "@/services/baseService";
import { fetchWithAuth } from "@/lib/api-client";

interface ConnectionRequestParams {
  recipientId: string;
}

export const connectionService = {
  async sendConnectionRequest(params: ConnectionRequestParams): Promise<ServiceResult<string>> {
    try {
      const response = await fetchWithAuth("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            userMessage: data.error || "Failed to send connection request.",
            code: "connection_error",
            message: data.error || "Failed to send connection request.",
            statusCode: response.status,
          },
        };
      }

      return { data: data.status, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          userMessage: "Failed to send connection request.",
          code: "connection_error",
          message: error instanceof Error ? error.message : "Unknown error",
          statusCode: 500,
        },
      };
    }
  },

  async getConnectionStatus(targetUserId: string): Promise<ServiceResult<{ status: string, conversationId?: string }>> {
    try {
      const response = await fetchWithAuth(`/api/connections/status?targetUserId=${encodeURIComponent(targetUserId)}`);
      const data = await response.json();
      
      if (!response.ok) {
        return {
          data: null,
          error: {
            userMessage: data.error || "Failed to fetch connection status.",
            code: "connection_error",
            message: data.error || "Failed to fetch connection status.",
            statusCode: response.status,
          },
        };
      }
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          userMessage: "Failed to fetch connection status.",
          code: "connection_error",
          message: error instanceof Error ? error.message : "Unknown error",
          statusCode: 500,
        },
      };
    }
  },

  async updateConnectionStatus(targetUserId: string, action: "accept" | "reject"): Promise<ServiceResult<string>> {
    try {
      const response = await fetchWithAuth("/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            userMessage: data.error || `Failed to ${action} connection.`,
            code: "connection_error",
            message: data.error || `Failed to ${action} connection.`,
            statusCode: response.status,
          },
        };
      }

      return { data: data.status, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          userMessage: `Failed to ${action} connection.`,
          code: "connection_error",
          message: error instanceof Error ? error.message : "Unknown error",
          statusCode: 500,
        },
      };
    }
  },
};