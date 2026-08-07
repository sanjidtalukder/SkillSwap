"use client";

import React, { memo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { NavLink } from "@/components/common/NavLink";
import { ROUTES, SITE_CONFIG } from "@/constants";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authService } from "@/features/auth/services/authService";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { SideDrawer } from "@/components/navigation/SideDrawer";
import { Avatar } from "@/components/ui/Avatar";

export const Header = memo(function Header() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    router.push(ROUTES.HOME);
  };

  return (
    <>
      <header
        role="banner"
        aria-label="Main Navigation Header"
        className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      >
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between gap-3 px-4">
          
          {/* Left: Logo */}
          <Link
            href={ROUTES.HOME}
            aria-label="SkillSwap Home"
            className="flex shrink-0 items-center space-x-2 text-lg font-bold sm:text-xl transition-opacity hover:opacity-80"
          >
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              {SITE_CONFIG.name}
            </span>
          </Link>

          {/* Desktop Navigation (Hidden on Mobile) */}
          <nav
            role="navigation"
            aria-label="Primary Desktop Navigation"
            className="hidden md:flex flex-1 items-center justify-end h-full gap-2"
          >
            <NavLink href={ROUTES.PROJECTS} ariaLabel="Browse Projects">
              Projects
            </NavLink>
            <NavLink href={ROUTES.SKILLS} ariaLabel="Browse Skills">
              Skills
            </NavLink>
            
            {loading ? null : isAuthenticated ? (
              <>
                <NavLink href={ROUTES.DASHBOARD} ariaLabel="Open Dashboard">
                  Dashboard
                </NavLink>
                
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border/40 h-8">
                  <NotificationBell />
                  
                  <Link 
                    href={`/u/${user?.uid}`} 
                    className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
                  >
                    <Avatar 
                      src={user?.photoURL || undefined} 
                      alt="Profile" 
                      className="w-8 h-8 border border-border/50" 
                    />
                    <span className="max-w-[140px] truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {user?.displayName || user?.email}
                    </span>
                  </Link>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    aria-label="Logout"
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full px-2"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border/40 h-8">
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Right Controls (Hidden on Desktop) */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && (
              <>
                <NotificationBell />
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="p-2 ml-1 text-foreground/80 hover:bg-muted/50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                  aria-label="Open mobile menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </>
            )}
            
            {!loading && !isAuthenticated && (
              <Link href={ROUTES.LOGIN}>
                <Button variant="primary" size="sm" className="h-8 text-xs">
                  Login
                </Button>
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* Mobile Global Navigation Elements */}
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <MobileBottomNav />
    </>
  );
});
