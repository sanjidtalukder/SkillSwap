import React from "react";
import { Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AnnouncementToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  filter: string;
  onFilterChange: (val: string) => void;
}

export function AnnouncementToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: AnnouncementToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-6 border-b border-border/40">
      <div className="flex-1 w-full sm:max-w-md flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border/60 rounded-md bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-colors"
          />
        </div>

        <div className="flex items-center bg-card border border-border/60 rounded-md overflow-hidden shrink-0">
          <div className="px-3 py-2 text-muted-foreground flex items-center bg-muted/20">
            <Filter className="w-4 h-4 mr-2" />
            <select 
              className="bg-transparent text-sm focus:outline-none text-foreground cursor-pointer"
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option className="bg-card text-foreground" value="latest">Latest</option>
              <option className="bg-card text-foreground" value="pinned">Pinned</option>
              <option className="bg-card text-foreground" value="oldest">Oldest</option>
              <option className="bg-card text-foreground" value="attachments">With Attachments</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
