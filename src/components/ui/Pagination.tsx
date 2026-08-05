import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  // Calculates which pages to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      // If there are few pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of sliding window
      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);

      // Adjust window if we are near the beginning
      if (currentPage <= 3) {
        end = maxVisiblePages;
      }
      // Adjust window if we are near the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - maxVisiblePages + 1;
      }

      // Add left ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add right ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 mt-4 pb-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-brand disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all cursor-pointer shadow-sm"
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {pages.map((p, index) => {
        if (p === '...') {
          return (
            <div key={`ellipsis-${index}`} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          );
        }

        const pageNum = p as number;
        const isActive = currentPage === pageNum;

        return (
          <button
            key={`page-${pageNum}`}
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
              isActive
                ? 'bg-brand text-white shadow-md shadow-brand/20 border border-brand'
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 hover:border-brand/30 hover:text-brand shadow-sm'
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-brand disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all cursor-pointer shadow-sm"
        aria-label="Página siguiente"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </div>
  );
};
