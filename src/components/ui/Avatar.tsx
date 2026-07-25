import React, { memo } from "react";
import Image from "next/image";
import { cn } from "@/utils";

export interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

export const Avatar = memo(function Avatar({ src, alt, size = "md", className }: AvatarProps) {
  const dimension = sizeMap[size];
  const initials = alt
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full border border-border/60 bg-muted",
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={dimension}
          height={dimension}
          className="h-full w-full object-cover"
          loading="lazy"
          quality={85}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex select-none items-center justify-center rounded-full border border-primary/30 bg-primary/20 font-semibold text-primary",
        sizeClasses[size],
        className
      )}
    >
      {initials || "?"}
    </div>
  );
});
