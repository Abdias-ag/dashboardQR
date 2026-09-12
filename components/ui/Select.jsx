'use strict';

import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Select({
  label,
  error,
  options = [],
  className,
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
      <select
        id={id}
        className={twMerge(
          clsx(
            'w-full bg-white dark:bg-zinc-950 border text-sm text-slate-700 dark:text-slate-200 rounded-xl py-3 px-4 transition-colors focus:outline-none focus:border-orange-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-zinc-800'
          ),
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-slate-200">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-400 mt-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
