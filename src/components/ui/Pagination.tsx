import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./Button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <nav className="flex items-center justify-center space-x-2 mt-12" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 px-3 mr-2 transition-all duration-200 hover:bg-muted hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>

      {/* Desktop view: individual page numbers */}
      <div className="hidden sm:flex items-center space-x-1 sm:space-x-1.5">
        {getPageNumbers().map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center text-muted-foreground/60">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          const isActive = currentPage === page;

          return (
            <Button
              key={page}
              variant={isActive ? "primary" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className={`h-9 w-9 p-0 transition-all duration-300 ${
                isActive 
                  ? "pointer-events-none shadow-sm shadow-primary/20" 
                  : "hover:bg-muted/80 text-muted-foreground hover:text-foreground border-transparent hover:border-border/50"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {page}
            </Button>
          );
        })}
      </div>

      {/* Mobile view: text summary instead of page numbers */}
      <div className="flex sm:hidden items-center justify-center text-sm font-medium text-muted-foreground px-2">
        Page {currentPage} of {totalPages}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 px-3 ml-2 transition-all duration-200 hover:bg-muted hover:text-foreground"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </nav>
  );
}
