import { storage } from "@/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ServiceResult } from "@/services/baseService";

export const profileService = {
  async uploadProfilePhoto(uid: string, file: File): Promise<ServiceResult<string>> {
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const avatarRef = ref(storage, `avatars/${uid}/profile.${extension}`);
      await uploadBytes(avatarRef, file, { contentType: file.type });
      const downloadUrl = await getDownloadURL(avatarRef);
      return { data: downloadUrl, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          userMessage: "Failed to upload profile picture.",
          code: "upload_error",
          message: error instanceof Error ? error.message : "Unknown error",
          statusCode: 500
        }
      };
    }
  },

  async saveCompletedProfile(firebaseUid: string, input: any): Promise<ServiceResult<void>> {
    try {
      const response = await fetch("/api/db/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid, input })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          data: null,
          error: {
            userMessage: errorData.error || "Failed to save profile",
            code: "save_error",
            message: errorData.error || "Failed to save profile",
            statusCode: response.status
          }
        };
      }

      return { data: undefined, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          userMessage: "Failed to save profile.",
          code: "save_error",
          message: error instanceof Error ? error.message : "Unknown error",
          statusCode: 500
        }
      };
    }
  }
};

export type { UserProfile, CompleteProfileInput } from "@/features/profiles/types/profile";