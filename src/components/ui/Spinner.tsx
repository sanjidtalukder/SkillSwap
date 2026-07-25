import React, { HTMLAttributes, memo } from "react";
import { cn } from "@/utils";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 stroke-[3]",
  md: "h-6 w-6 stroke-[3]",
  lg: "h-10 w-10 stroke-[2.5]",
  xl: "h-14 w-14 stroke-[2]",
};

export const Spinner = memo(function Spinner({
  size = "md",
  label = "Loading...",
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center text-primary", className)}
      {...props}
    >
      <svg
        className={cn("animate-spin text-current", sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
});
