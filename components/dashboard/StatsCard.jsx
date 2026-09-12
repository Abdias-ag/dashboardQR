'use strict';

import React from 'react';
import Card from '../ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  description,
  variant = 'indigo',
}) {
  const iconColors = {
    indigo: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };

  return (
    <Card hoverable className="p-4 sm:p-6 relative overflow-hidden">
      <div className="flex justify-between items-start gap-2 sm:gap-4">
        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate">{title}</p>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-black dark:text-white tracking-tight truncate">{value}</h3>
        </div>
        {Icon && (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${iconColors[variant] || iconColors.indigo}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800/40">
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${trendDirection === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trendDirection === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{trend}</span>
          </div>
        )}
        <span className="text-xs text-slate-600 dark:text-slate-500 font-medium line-clamp-2">{description}</span>
      </div>
    </Card>
  );
}
