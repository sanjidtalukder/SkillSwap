import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { UserDocument } from "@/types/firestore";
import { handleServiceCall, ServiceResult } from "@/services/baseService";

export interface SearchFilters {
  searchTerm?: string; // Search by Name or Keyword
  skill?: string; // Filter by Skill
  department?: string; // Filter by Department
  semester?: string; // Filter by Semester
}

export interface SearchResultPage {
  users: UserDocument[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

const USERS_COLLECTION = "users";
const DEFAULT_PAGE_SIZE = 15;

/**
 * Scalable Search Service Architecture
 * Supports multi-field filtering by Name, Skill, Department, and Semester.
 * Employs cursor-based pagination and array-contains queries.
 */
export const searchService = {
  async searchStudents(
    filters: SearchFilters,
    pageSize = DEFAULT_PAGE_SIZE,
    cursor?: QueryDocumentSnapshot<DocumentData> | null
  ): Promise<ServiceResult<SearchResultPage>> {
    return handleServiceCall(async () => {
      const constraints = [];

      constraints.push(where("profileCompleted", "==", true));

      // 1. Filter by Skill
      if (filters.skill && filters.skill.trim().length > 0) {
        constraints.push(where("skillsOffered", "array-contains", filters.skill.trim()));
      }
      // 2. Filter by Department
      else if (filters.department && filters.department.trim().length > 0) {
        constraints.push(where("department", "==", filters.department.trim()));
      }
      // 3. Filter by Semester
      else if (filters.semester && filters.semester.trim().length > 0) {
        constraints.push(where("semester", "==", filters.semester.trim()));
      }
      // 4. Keyword / Name Search
      else if (filters.searchTerm && filters.searchTerm.trim().length > 0) {
        const term = filters.searchTerm.trim().toLowerCase();
        constraints.push(where("searchKeywords", "array-contains", term));
      }

      // Cursor Pagination Constraints
      if (cursor) {
        constraints.push(startAfter(cursor));
      }

      constraints.push(limit(pageSize + 1)); // Fetch 1 extra to check hasMore

      const q = query(collection(db, USERS_COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);

      const docs = querySnapshot.docs;
      const hasMore = docs.length > pageSize;
      const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;

      const users = resultDocs.map((docSnap) => ({
        uid: docSnap.id,
        ...docSnap.data(),
      })) as UserDocument[];

      const lastDoc = resultDocs.length > 0 ? resultDocs[resultDocs.length - 1] : null;

      return {
        users,
        lastDoc,
        hasMore,
      };
    }, "Failed to search student profiles.");
  },
};
