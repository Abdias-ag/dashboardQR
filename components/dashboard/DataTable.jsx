'use strict';

import React from 'react';
import Skeleton from '../ui/Skeleton';

export default function DataTable({ columns, data, loading, skeletonRows = 5, keyField = 'id', emptyState }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/40">
            {columns.map((col) => (
              <th
                key={col.key}
                className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="py-4 px-5">
                    <Skeleton className="h-4 w-full rounded" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-slate-500 text-xs">
                {emptyState || 'Aucune donnée disponible'}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row[keyField]} className="hover:bg-slate-900/40 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="py-4 px-5 text-slate-300 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
