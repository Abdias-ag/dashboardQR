'use strict';

import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Card({
  children,
  className,
  hoverable = false,
  ...props
}) {
  return (
    <div
      className={twMerge(
        clsx(
          'glass border rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden text-slate-800 dark:text-slate-100',
          hoverable && 'transition-all duration-300 hover:border-orange-500/50 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-orange-500/5 dark:hover:shadow-black/50'
        ),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
