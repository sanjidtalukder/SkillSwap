"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, Folder, Lightbulb, Search, Bell, X } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authService } from "@/features/auth/services/authService";
import { Avatar } from "@/components/ui/Avatar";
import { ROUTES } from "@/constants";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isAuthenticated || !isOpen) return null;

  const handleLogout = async () => {
    await authService.logout();
    onClose();
    window.location.href = ROUTES.HOME;
  };

  const navItems = [
    { name: "Dashboard", href: ROUTES.DASHBOARD, icon: Home },
    { name: "Projects", href: ROUTES.PROJECTS, icon: Folder },
    { name: "Skills", href: ROUTES.SKILLS, icon: Lightbulb },
    { name: "Search", href: "/search", icon: Search },
    { name: "Notifications", href: "/notifications", icon: Bell },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 left-0 z-[101] w-4/5 max-w-sm bg-background border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
      >
        {/* Header / Profile section */}
        <div className="flex flex-col p-6 border-b border-border/40 bg-muted/10 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="mb-4">
            <Avatar src={user?.photoURL || undefined} alt="Profile" className="w-16 h-16 border-2 border-primary/20" />
          </div>
          <h2 className="text-lg font-bold text-foreground">
            {user?.displayName || "SkillSwap User"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {user?.email}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground font-medium"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-primary fill-primary/10" : "text-muted-foreground"}`} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-border/40">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-red-500 font-medium hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </div>
    </>
  );
}
