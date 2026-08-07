"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activePattern?: string; // Optional custom regex pattern string for matching
  ariaLabel?: string;
}

export function NavLink({ href, children, className, activePattern, ariaLabel }: NavLinkProps) {
  const pathname = usePathname();
  
  // Determine if the current route is active.
  // If activePattern is provided, we test against it (e.g. "^/projects").
  // Otherwise, fallback to a startsWith match (handling the root "/" specifically).
  const isActive = activePattern
    ? new RegExp(activePattern).test(pathname)
    : href === "/" 
      ? pathname === "/"
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "relative px-3 py-4 transition-all duration-200 text-sm font-medium flex items-center h-full hover:text-foreground",
        isActive 
          ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-t-md" 
          : "text-foreground/60",
        className
      )}
    >
      {children}
    </Link>
  );
}
