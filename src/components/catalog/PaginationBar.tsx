import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  entityName?: string;
  limitOptions?: number[];
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  page,
  totalPages,
  totalProducts,
  limit,
  onPageChange,
  onLimitChange,
  entityName = 'productos',
  limitOptions = [12, 24, 50, 100],
}) => {
  if (totalProducts === 0) return null;

  // Generar arreglo de números de página (ej. 1, 2, 3...)
  const pages = [];
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, page + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalProducts);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm mt-8">
      {/* Resumen de cantidad e ítems por página */}
      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
        <span>
          Mostrando <strong className="text-slate-800 font-bold">{startItem}</strong> - <strong className="text-slate-800 font-bold">{endItem}</strong> de <strong className="text-slate-800 font-bold">{totalProducts}</strong> {entityName}
        </span>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <label htmlFor="limit-select" className="text-slate-500 font-medium">Artículos por página</label>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer"
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Botonera de paginación « 1 2 3 » */}
      <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
        {/* Anterior */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-10 px-3 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-brand border-r border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-colors"
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Primera página si está lejos */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="h-10 px-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand border-r border-slate-200 transition-colors"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="h-10 px-2 flex items-center text-xs text-slate-400 border-r border-slate-200">
                ...
              </span>
            )}
          </>
        )}

        {/* Páginas intermedias */}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-10 px-3.5 text-xs font-bold border-r border-slate-200 transition-all ${
              p === page
                ? 'bg-brand text-white font-black'
                : 'text-slate-600 hover:bg-slate-50 hover:text-brand'
            }`}
          >
            {p}
          </button>
        ))}

        {/* Última página si está lejos */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="h-10 px-2 flex items-center text-xs text-slate-400 border-r border-slate-200">
                ...
              </span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="h-10 px-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand border-r border-slate-200 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Siguiente */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-10 px-3 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-brand disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-colors"
          title="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
