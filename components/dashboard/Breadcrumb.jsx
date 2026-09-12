'use strict';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Breadcrumb({ items = [] }) {
  const router = useRouter();
  const allItems = [{ label: 'Accueil', path: '/dashboard' }, ...items];

  return (
    <nav className="flex items-center gap-1 text-xs text-slate-500 font-medium" aria-label="Breadcrumb">
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        return (
          <React.Fragment key={item.label}>
            {index > 0 && <ChevronRight className="w-3 h-3 text-slate-700 shrink-0" />}
            {isLast ? (
              <span className="text-slate-300 font-semibold">{item.label}</span>
            ) : (
              <button
                onClick={() => item.path && router.push(item.path)}
                className="hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                {index === 0 && <Home className="w-3 h-3" />}
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
