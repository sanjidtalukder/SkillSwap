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
        "px-3 py-1.5 transition-all duration-200 text-sm",
        isActive 
          ? "bg-primary text-primary-foreground font-semibold rounded-md shadow-[0_4px_14px_0_rgba(0,118,255,0.2)]" 
          : "text-foreground/60 font-medium hover:text-foreground/90 hover:bg-muted/50 rounded-md",
        className
      )}
    >
      {children}
    </Link>
  );
}
