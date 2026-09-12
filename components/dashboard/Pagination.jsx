'use strict';

import React from 'react';
import Button from '../ui/Button';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  let prev = -1;
  const renderedPages = [];
  for (const p of showPages) {
    if (prev !== -1 && p - prev > 1) {
      renderedPages.push('...');
    }
    renderedPages.push(p);
    prev = p;
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="text-slate-400 disabled:opacity-30"
      >
        ← Précédent
      </Button>

      <div className="flex items-center gap-1">
        {renderedPages.map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="px-2 text-slate-600 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                p === page
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="text-slate-400 disabled:opacity-30"
      >
        Suivant →
      </Button>
    </div>
  );
}
