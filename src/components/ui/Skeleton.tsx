import { HTMLAttributes } from "react";
import { cn } from "@/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-muted/60", className)} {...props} />;
}
