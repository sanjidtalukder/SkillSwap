/**
 * Client-safe profileService.
 * All DB operations go through API routes — NO Prisma, NO server imports.
 */
import { ServiceResult } from "@/services/baseService";
import { fetchWithAuth } from "@/lib/api-client";

export const profileService = {
  async ensureProfileShell(user: {
    uid: string;
    email: string | null;
    displayName: string | null;
  }): Promise<ServiceResult<void>> {
    try {
      const response = await fetchWithAuth("/api/db/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName || user.email?.split("@")[0] || "SkillSwap Member",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          data: null,
          error: {
            userMessage: errorData.error || "Failed to initialize your profile.",
            code: "profile_init_error",
            message: errorData.error || "Failed to initialize your profile.",
            statusCode: response.status,
          },
        };
      }

      return { data: undefined, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          userMessage: "Failed to initialize your profile.",
          code: "profile_init_error",
          message: error instanceof Error ? error.message : "Unknown error",
          statusCode: 500,
        },
      };
    }
  },
};

export type { UserProfile, CompleteProfileInput } from "@/features/profiles/types/profile";