'use strict';

import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';

export default function SearchBar({
  search,
  setSearch,
  placeholder = 'Rechercher...',
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  sortOptions = [],
  filterOptions = [],
  selectedFilter,
  setSelectedFilter,
}) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-zinc-900/40 p-4 border border-slate-200 dark:border-zinc-800/60 rounded-2xl shrink-0">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
          className="w-full bg-slate-50 dark:bg-zinc-950/60"
        />
      </div>

      {/* Sort / Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {filterOptions.length > 0 && (
          <Select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            options={filterOptions}
            className="bg-white dark:bg-zinc-950/80 py-2.5 px-3 border border-slate-200 dark:border-zinc-800/60 rounded-xl text-xs w-36 text-slate-700 dark:text-slate-200"
          />
        )}

        {(sortOptions.length > 0 || setSortBy) && (
          <>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Trier par
            </span>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={sortOptions}
              className="bg-white dark:bg-zinc-950/80 py-2.5 px-3 border border-slate-200 dark:border-zinc-800/60 rounded-xl text-xs w-40 text-slate-700 dark:text-slate-200"
            />
            <Select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
              options={[
                { value: 'desc', label: 'Décroissant' },
                { value: 'asc', label: 'Croissant' },
              ]}
              className="bg-white dark:bg-zinc-950/80 py-2.5 px-3 border border-slate-200 dark:border-zinc-800/60 rounded-xl text-xs w-28 text-slate-700 dark:text-slate-200"
            />
          </>
        )}
      </div>
    </div>
  );
}
