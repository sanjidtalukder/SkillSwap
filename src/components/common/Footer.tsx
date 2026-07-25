import React, { memo } from "react";
import { SITE_CONFIG } from "@/constants";

export const Footer = memo(function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="Footer"
      className="border-t border-border/40 py-6 md:py-0"
    >
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. Built for student collaboration.
        </p>
      </div>
    </footer>
  );
});
