'use strict';

import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Avatar({
  src,
  firstname = 'U',
  lastname = '',
  size = 'md',
  className,
  ...props
}) {
  const initials = `${firstname ? firstname[0] : ''}${lastname ? lastname[0] : ''}`.toUpperCase() || 'U';

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-bold',
    lg: 'w-16 h-16 text-xl font-bold',
  };

  const isLocalFile = src && (src.startsWith('/') || src.startsWith('http'));
  const avatarUrl = isLocalFile && src.startsWith('/') ? `http://localhost:5000${src}` : src;

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-white shrink-0 shadow-inner select-none',
          sizes[size]
        ),
        className
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={`${firstname} ${lastname}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // fallback si l'image n'est pas accessible
            e.target.style.display = 'none';
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}
