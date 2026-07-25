"use client";

import { useEffect, useState, memo } from "react";

export const OfflineIndicator = memo(function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="assertive"
      className="animate-in fade-in slide-in-from-bottom-2 fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/15 px-4 py-2.5 text-sm font-medium text-amber-400 shadow-lg backdrop-blur-md duration-200"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
      </span>
      <span>You are currently offline. Changes will sync when reconnected.</span>
    </div>
  );
});
