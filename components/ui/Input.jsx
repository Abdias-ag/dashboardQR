'use strict';

import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Input({
  label,
  error,
  className,
  icon: Icon,
  type = 'text',
  id,
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 flex items-center pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          id={id}
          className={twMerge(
            clsx(
              'w-full bg-white dark:bg-zinc-950 border text-sm text-slate-800 dark:text-white rounded-xl py-3 px-4 transition-colors focus:outline-none focus:border-orange-500 placeholder-slate-400 dark:placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed',
              Icon ? 'pl-11' : 'pl-4',
              error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-zinc-800'
            ),
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1 font-medium animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
}
