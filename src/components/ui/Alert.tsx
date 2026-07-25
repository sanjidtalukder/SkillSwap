import React, { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "warning" | "success" | "info";
  title?: string;
  children: ReactNode;
}

export function Alert({ className, variant = "error", title, children, ...props }: AlertProps) {
  const baseStyles =
    "relative w-full rounded-lg border p-4 text-sm backdrop-blur-xs transition-all";

  const variants = {
    error:
      "border-destructive/40 bg-destructive/10 text-destructive dark:border-destructive/50 dark:bg-destructive/15",
    warning:
      "border-amber-500/40 bg-amber-500/10 text-amber-400 dark:border-amber-500/50 dark:bg-amber-500/15",
    success:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 dark:border-emerald-500/50 dark:bg-emerald-500/15",
    info: "border-primary/40 bg-primary/10 text-primary dark:border-primary/50 dark:bg-primary/15",
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {title && <h5 className="mb-1 font-semibold leading-none tracking-tight">{title}</h5>}
      <div className="text-sm leading-relaxed opacity-90">{children}</div>
    </div>
  );
}
