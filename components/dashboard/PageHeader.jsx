'use strict';

import React from 'react';
import Breadcrumb from './Breadcrumb';

export default function PageHeader({ title, description, breadcrumb = [], actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
      <div className="space-y-1.5 min-w-0 flex-1">
        {breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}
        <h1 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold tracking-tight text-slate-800 dark:text-white break-words">{title}</h1>
        {description && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto justify-end">{actions}</div>}
    </div>
  );
}
