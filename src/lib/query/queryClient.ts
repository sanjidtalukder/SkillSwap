import { QueryClient } from "@tanstack/react-query";

/**
 * Optimized QueryClient Instance
 * Configured with 5-minute staleTime and 10-minute gcTime to minimize redundant Firestore reads.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes stale time to conserve read quota
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
