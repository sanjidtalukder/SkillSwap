"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Folder, Lightbulb, Search, User } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { ROUTES } from "@/constants";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading || !isAuthenticated) return null;

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { name: "Dashboard", href: ROUTES.DASHBOARD, icon: Home },
    { name: "Projects", href: ROUTES.PROJECTS, icon: Folder },
    { name: "Skills", href: ROUTES.SKILLS, icon: Lightbulb },
    { name: "Search", href: "/search", icon: Search },
    { name: "Profile", href: `/u/${user?.uid}`, isProfile: true }, // Using a custom check for profile
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border/40 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.isProfile ? (
              <div className={`p-0.5 rounded-full border-2 transition-colors ${isActive ? 'border-primary' : 'border-transparent'}`}>
                {user?.photoURL ? (
                  <Avatar src={user.photoURL} alt="Profile" className="w-6 h-6" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">
                    {getInitials(user?.displayName || user?.email)}
                  </div>
                )}
              </div>
            ) : (
              item.icon && <item.icon className={`w-5 h-5 ${isActive ? "fill-primary/20" : ""}`} />
            )}
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
