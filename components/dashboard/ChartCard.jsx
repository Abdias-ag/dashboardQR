'use strict';

import React from 'react';
import Card from '../ui/Card';
import { ResponsiveContainer } from 'recharts';

export default function ChartCard({ title, subtitle, children, action, className = '' }) {
  return (
    <Card className={`space-y-3 sm:space-y-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0 self-end sm:self-start">{action}</div>}
      </div>
      <div className="h-48 sm:h-72 w-full overflow-x-auto">
        {children}
      </div>
    </Card>
  );
}
