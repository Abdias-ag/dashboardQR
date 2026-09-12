'use strict';

import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Badge({
  children,
  className,
  variant = 'info',
  ...props
}) {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider select-none shrink-0';

  const variants = {
    success: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
    info: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    slate: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-zinc-700/50',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant]), className)} {...props}>
      {children}
    </span>
  );
}
