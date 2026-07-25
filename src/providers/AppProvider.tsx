"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Unified Root Client Provider
 * Wraps TanStack Query, offline indicator, and global context providers.
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryProvider>
      {children}
      <OfflineIndicator />
    </QueryProvider>
  );
}
