import { User } from "firebase/auth";
import { ROUTES } from "@/constants";
import { ServiceResult } from "@/services/baseService";

export interface ProfileRouteStatus {
  profileCompleted: boolean;
}

export const profileRoutingService = {
  async getRouteForUser(user: User): Promise<ServiceResult<ProfileRouteStatus>> {
    try {
      const response = await fetch(`/api/db/profile?uid=${user.uid}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist, ensure profile shell
          const ensureResponse = await fetch("/api/db/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firebaseUid: user.uid,
              email: user.email,
              name: user.displayName || user.email?.split("@")[0] || "SkillSwap Member"
            })
          });

          if (!ensureResponse.ok) {
            const errorData = await ensureResponse.json();
            const msg = errorData.error || "Failed to create profile";
            return {
              data: null,
              error: {
                userMessage: msg,
                code: "profile_create_error",
                message: msg,
                statusCode: ensureResponse.status
              }
            };
          }

          return { data: { profileCompleted: false }, error: null };
        }

        const errorData = await response.json();
        const msg = errorData.error || "Failed to check profile";
        return {
          data: null,
          error: {
            userMessage: msg,
            code: "profile_check_error",
            message: msg,
            statusCode: response.status
          }
        };
      }

      const profileData = await response.json();
      return { data: { profileCompleted: profileData.data.profileCompleted }, error: null };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to check profile status";
      return {
        data: null,
        error: {
          userMessage: msg,
          code: "profile_status_error",
          message: msg,
          statusCode: 500
        }
      };
    }
  },

  getRouteForStatus(status: ProfileRouteStatus): string {
    return status.profileCompleted ? ROUTES.DASHBOARD : ROUTES.COMPLETE_PROFILE;
  }
};