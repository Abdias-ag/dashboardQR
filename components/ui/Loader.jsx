'use strict';

import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Loader({
  className,
  size = 'md',
  ...props
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={twMerge('flex flex-col items-center justify-center gap-3 py-6', className)} {...props}>
      <Loader2 className={clsx('animate-spin text-indigo-500', sizes[size])} />
      <span className="text-xs text-slate-500 font-medium">Chargement en cours...</span>
    </div>
  );
}
