/**
 * Client-safe connectionService.
 * All DB operations go through API routes — NO Prisma, NO server imports.
 */
import { ServiceResult } from "@/services/baseService";

interface ConnectionRequestParams {
  requesterId: string;
  requesterName: string;
  requesterPhoto: string;
  recipientId: string;
}

export const connectionService = {
  async sendConnectionRequest(params: ConnectionRequestParams): Promise<ServiceResult<string>> {
    try {
      const response = await fetch("/api/connections", {
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
};