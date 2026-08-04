import { User } from "firebase/auth";
import { ROUTES } from "@/constants";
import { ServiceResult } from "@/services/baseService";
import { profileService } from "@/features/profiles/services/profileService";

export interface ProfileRouteStatus {
  profileCompleted: boolean;
  route: typeof ROUTES.DASHBOARD | typeof ROUTES.COMPLETE_PROFILE;
}

export const profileRoutingService = {
  async getRouteForUser(user: User): Promise<ServiceResult<ProfileRouteStatus>> {
    let profileResult = await profileService.getProfile(user.uid);
    if (profileResult.error) {
      return { data: null, error: profileResult.error };
    }

    if (!profileResult.data) {
      const shellResult = await profileService.ensureProfileShell(user);
      if (shellResult.error) {
        return { data: null, error: shellResult.error };
      }

      return {
        data: {
          profileCompleted: false,
          route: ROUTES.COMPLETE_PROFILE,
        },
        error: null,
      };
    }

    const profileCompleted = Boolean(profileResult.data.profileCompleted);

    return {
      data: {
        profileCompleted,
        route: profileCompleted ? ROUTES.DASHBOARD : ROUTES.COMPLETE_PROFILE,
      },
      error: null,
    };
  },
};
