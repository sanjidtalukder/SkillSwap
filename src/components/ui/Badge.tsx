import React, { HTMLAttributes, memo } from "react";
import { cn } from "@/utils";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

export const Badge = memo(function Badge({ className, variant = "primary", ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variants = {
    primary: "border-primary/30 bg-primary/20 text-primary-300 border shadow-xs",
    secondary: "border-slate-700 bg-slate-800/80 text-slate-300 border",
    success: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300 border shadow-xs",
    warning: "border-amber-500/30 bg-amber-500/15 text-amber-300 border shadow-xs",
    destructive: "border-rose-500/30 bg-rose-500/15 text-rose-300 border shadow-xs",
    outline: "text-slate-300 border border-slate-700/80 bg-slate-800/40",
  };

  return <div className={cn(baseStyles, variants[variant], className)} {...props} />;
});
