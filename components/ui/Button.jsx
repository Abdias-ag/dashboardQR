'use strict';

import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all cursor-pointer select-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 border border-transparent',
    secondary: 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-zinc-700/50',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 border border-transparent',
    ghost: 'hover:bg-slate-100 dark:hover:bg-zinc-800/50 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white',
    outline: 'border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-2 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
