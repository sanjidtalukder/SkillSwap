"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Unhandled App Error]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4 rounded-xl border border-destructive/30 bg-destructive/10 p-6">
        <h2 className="text-2xl font-bold text-destructive">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. Please try resetting the view or contact support if the
          issue persists.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => reset()}>
            Try Again
          </Button>
          <Button variant="primary" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
