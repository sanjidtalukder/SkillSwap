"use client";

import React, { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { NavLink } from "@/components/common/NavLink";
import { ROUTES, SITE_CONFIG } from "@/constants";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authService } from "@/features/auth/services/authService";

export const Header = memo(function Header() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await authService.logout();
    router.push(ROUTES.HOME);
  };

  return (
    <header
      role="banner"
      aria-label="Main Navigation Header"
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between gap-3 px-4">
        <Link
          href={ROUTES.HOME}
          aria-label="SkillSwap Home"
          className="flex shrink-0 items-center space-x-2 text-lg font-bold sm:text-xl"
        >
          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            {SITE_CONFIG.name}
          </span>
        </Link>
        <nav
          role="navigation"
          aria-label="Primary Navigation"
          className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto whitespace-nowrap text-xs sm:gap-2 sm:text-sm"
        >
          <NavLink
            href={ROUTES.PROJECTS}
            ariaLabel="Browse Projects"
          >
            Projects
          </NavLink>
          <NavLink
            href={ROUTES.SKILLS}
            ariaLabel="Browse Skills"
          >
            Skills
          </NavLink>
          {loading ? null : isAuthenticated ? (
            <>
              <NavLink
                href={ROUTES.DASHBOARD}
                ariaLabel="Open Dashboard"
              >
                Dashboard
              </NavLink>
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border/40">
                <span className="hidden max-w-40 truncate text-foreground/60 sm:inline">
                  {user?.displayName || user?.email}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  aria-label="Logout from SkillSwap"
                  className="text-foreground/70"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <NavLink
                href={ROUTES.REGISTER}
                ariaLabel="Create a SkillSwap account"
              >
                Register
              </NavLink>
              <NavLink
                href={ROUTES.LOGIN}
                ariaLabel="Login to SkillSwap"
              >
                Login
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
});
