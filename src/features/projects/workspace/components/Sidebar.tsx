"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Settings, 
  FolderOpen, 
  CheckSquare 
} from "lucide-react";

interface SidebarProps {
  projectId: string;
  isOwner: boolean;
}

export function Sidebar({ projectId, isOwner }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: `/projects/${projectId}/workspace`, icon: LayoutDashboard },
    { name: "Group Chat", href: `/projects/${projectId}/workspace/chat`, icon: MessageSquare },
    { name: "Members", href: `/projects/${projectId}/workspace/members`, icon: Users },
    { name: "Files", href: `/projects/${projectId}/workspace/files`, icon: FolderOpen },
    { name: "Tasks", href: `/projects/${projectId}/workspace/tasks`, icon: CheckSquare, disabled: true },
  ];

  if (isOwner) {
    navItems.push({ name: "Settings", href: `/projects/${projectId}/workspace/settings`, icon: Settings, disabled: false });
  }

  return (
    <aside className="w-64 border-r border-border/40 bg-card hidden md:flex flex-col">
      <div className="p-4 border-b border-border/40">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Workspace</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.disabled) {
            return (
              <div
                key={item.name}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
                title="Coming Soon"
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/40">
        <Link href={`/projects/${projectId}`} className="text-xs text-muted-foreground hover:underline">
          &larr; Back to Project Page
        </Link>
      </div>
    </aside>
  );
}
