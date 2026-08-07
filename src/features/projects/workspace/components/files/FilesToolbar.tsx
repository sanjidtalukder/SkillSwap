import React from "react";
import { Search, Filter, ArrowUpDown, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FilesToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  filter: string;
  onFilterChange: (val: string) => void;
  sort: string;
  onSortChange: (val: string) => void;
}

export function FilesToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange
}: FilesToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 border-b border-border/40 bg-card">
      <div className="relative w-full sm:w-72">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search files or members..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-border/60 rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center bg-background border border-border/60 rounded-md overflow-hidden">
          <div className="px-3 py-2 border-r border-border/60 text-muted-foreground flex items-center bg-muted/20">
            <Filter className="w-4 h-4 mr-2" />
            <select 
              className="bg-transparent text-sm focus:outline-none text-foreground cursor-pointer"
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option value="all">All types</option>
              <option value="image">Images</option>
              <option value="document">Documents</option>
              <option value="archive">Archives</option>
              <option value="code">Code</option>
            </select>
          </div>
          <div className="px-3 py-2 text-muted-foreground flex items-center bg-muted/20">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <select 
              className="bg-transparent text-sm focus:outline-none text-foreground cursor-pointer"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="largest">Largest first</option>
              <option value="smallest">Smallest first</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
