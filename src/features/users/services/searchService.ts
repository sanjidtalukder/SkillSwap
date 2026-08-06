/**
 * Client-safe searchService.
 * All DB operations go through API routes — NO Prisma, NO server imports.
 */
import { ServiceResult } from "@/services/baseService";
import { UserProfile } from "@/features/profiles/types/profile";

export interface SearchFilters {
  searchTerm?: string;
  skill?: string;
  department?: string;
  semester?: string;
}

export interface SearchResultPage {
  users: UserProfile[];
  lastDoc: null;
  hasMore: boolean;
}

export const searchService = {
  async searchStudents(
    filters: SearchFilters,
    pageSize = 15
  ): Promise<ServiceResult<SearchResultPage>> {
    try {
      const params = new URLSearchParams();
      if (filters.searchTerm) params.set("searchTerm", filters.searchTerm);
      if (filters.skill) params.set("skill", filters.skill);
      if (filters.department) params.set("department", filters.department);
      if (filters.semester) params.set("semester", filters.semester);
      params.set("pageSize", String(pageSize));

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            userMessage: data.error || "Failed to search student profiles.",
            code: "search_error",
            message: data.error || "Failed to search student profiles.",
            statusCode: response.status,
          },
        };
      }

      return {
        data: {
          users: data.users || [],
          lastDoc: null,
          hasMore: data.hasMore || false,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          userMessage: "Failed to search student profiles.",
          code: "search_error",
          message: error instanceof Error ? error.message : "Unknown error",
          statusCode: 500,
        },
      };
    }
  },
};