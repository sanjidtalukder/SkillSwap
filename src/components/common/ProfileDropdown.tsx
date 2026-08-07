"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { UserProfile } from "@/features/profiles/types/profile";
import { Avatar } from "@/components/ui/Avatar";
import { ROUTES } from "@/constants";
import { 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Folder, 
  LayoutDashboard, 
  Bell, 
  Edit
} from "lucide-react";

interface ProfileDropdownProps {
  user: User;
  profile: UserProfile | null;
  onLogout: () => void;
}

export function ProfileDropdown({ user, profile, onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close on ESC
  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Trap focus / Keyboard navigation within dropdown
  const handleDropdownKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const focusableElements = dropdownRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), tabindex="0"'
      );
      if (!focusableElements || focusableElements.length === 0) return;
      
      const elementsArray = Array.from(focusableElements);
      const currentIndex = elementsArray.indexOf(document.activeElement as HTMLElement);
      
      let nextIndex = 0;
      if (e.key === "ArrowDown") {
        nextIndex = currentIndex < elementsArray.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : elementsArray.length - 1;
      }
      elementsArray[nextIndex].focus();
    }
  };

  const menuItems: Array<{label: string, icon: any, href: string, disabled?: boolean}> = [
    { label: "View Profile", icon: UserIcon, href: `/u/${profile?.username || user.uid}` },
    { label: "Edit Profile", icon: Edit, href: "/complete-profile?mode=edit" },
    { label: "Dashboard", icon: LayoutDashboard, href: ROUTES.DASHBOARD },
    { label: "My Projects", icon: Folder, href: "/dashboard?tab=projects" },
    { label: "Notifications", icon: Bell, href: "/notifications" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleItemClick = () => setIsOpen(false);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background group relative"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <Avatar 
          src={user.photoURL || undefined} 
          alt={profile?.fullName || user.displayName || "User"}
          className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-transparent group-hover:border-primary/50 transition-colors"
        />
        {/* Online Indicator */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          onKeyDown={handleDropdownKeyDown}
          className="absolute right-0 mt-2 w-64 rounded-xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
        >
          {/* Header Profile Section */}
          <div className="p-4 border-b border-border/40 bg-muted/10 rounded-t-xl">
            <div className="flex items-center gap-3">
              <Avatar 
                src={user.photoURL || undefined} 
                alt={profile?.fullName || user.displayName || "User"}
                className="w-12 h-12 border border-border/50"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-foreground">
                  {profile?.fullName || user.displayName || "SkillSwap User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{profile?.username || "user"}
                </p>
              </div>
            </div>
            {profile?.university && (
              <div className="mt-3 text-xs font-medium text-foreground/80 bg-background/50 border border-border/30 rounded-md p-2 truncate">
                🎓 {profile.university}
              </div>
            )}
          </div>

          {/* Links Section */}
          <div className="p-2 space-y-0.5">
            {menuItems.map((item) => (
              item.disabled ? (
                <div 
                  key={item.label}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground opacity-50 cursor-not-allowed rounded-md"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label} <span className="text-[10px] ml-auto uppercase tracking-wider">Soon</span>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleItemClick}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors outline-none focus-visible:bg-muted focus-visible:text-foreground"
                  role="menuitem"
                  tabIndex={0}
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  {item.label}
                </Link>
              )
            ))}
          </div>

          {/* Logout Section */}
          <div className="p-2 border-t border-border/40">
            <button
              onClick={() => {
                handleItemClick();
                onLogout();
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors outline-none focus-visible:bg-destructive/10"
              role="menuitem"
              tabIndex={0}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
