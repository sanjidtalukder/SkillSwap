"use client";

import { useState, useCallback, useTransition } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { searchService, SearchFilters, SearchResultPage } from "../services/searchService";
import { parseError } from "@/utils/errorHandler";

export function useSearchStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [skill, setSkill] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const debouncedSkill = useDebounce(skill, 400);

  const [results, setResults] = useState<SearchResultPage>({
    users: [],
    lastDoc: null,
    hasMore: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const executeSearch = useCallback(
    async (overrideFilters?: Partial<SearchFilters>) => {
      const activeFilters: SearchFilters = {
        searchTerm: overrideFilters?.searchTerm ?? debouncedSearchTerm,
        skill: overrideFilters?.skill ?? debouncedSkill,
        department: overrideFilters?.department ?? department,
        semester: overrideFilters?.semester ?? semester,
      };

      setIsLoading(true);
      setError(null);

      const res = await searchService.searchStudents(activeFilters);

      startTransition(() => {
        if (res.error) {
          setError(res.error.userMessage);
          setResults({ users: [], lastDoc: null, hasMore: false });
        } else if (res.data) {
          setResults(res.data);
        }
        setIsLoading(false);
      });
    },
    [debouncedSearchTerm, debouncedSkill, department, semester]
  );

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSkill("");
    setDepartment("");
    setSemester("");
    setResults({ users: [], lastDoc: null, hasMore: false });
    setError(null);
  }, []);

  return {
    filters: {
      searchTerm,
      skill,
      department,
      semester,
    },
    setSearchTerm,
    setSkill,
    setDepartment,
    setSemester,
    results: results.users,
    hasMore: results.hasMore,
    isLoading: isLoading || isPending,
    error,
    executeSearch,
    resetFilters,
  };
}
