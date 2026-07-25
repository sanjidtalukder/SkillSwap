import React, { HTMLAttributes, memo } from "react";
import { cn } from "@/utils";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

export const Badge = memo(function Badge({ className, variant = "primary", ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variants = {
    primary: "border-transparent bg-primary/15 text-primary border border-primary/20",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    success: "border-transparent bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    warning: "border-transparent bg-amber-500/15 text-amber-400 border border-amber-500/20",
    destructive:
      "border-transparent bg-destructive/15 text-destructive border border-destructive/20",
    outline: "text-foreground border border-border/80",
  };

  return <div className={cn(baseStyles, variants[variant], className)} {...props} />;
});
