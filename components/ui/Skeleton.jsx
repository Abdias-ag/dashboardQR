'use strict';

import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Skeleton({
  className,
  variant = 'text',
  ...props
}) {
  const baseStyle = 'bg-slate-800 animate-pulse';

  const variants = {
    text: 'h-4 rounded w-full',
    title: 'h-6 rounded w-3/4',
    circle: 'rounded-full aspect-square',
    rect: 'rounded-xl h-24 w-full',
  };

  return (
    <div
      className={twMerge(clsx(baseStyle, variants[variant]), className)}
      {...props}
    />
  );
}
