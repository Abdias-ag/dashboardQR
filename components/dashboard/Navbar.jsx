'use strict';

import React from 'react';
import { Menu, PanelLeft, PanelLeftClose, Search } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import Breadcrumb from './Breadcrumb';
import LanguageSelector from './LanguageSelector';
import { useSidebar } from '../../app/contexts/SidebarContext';

export default function Navbar({ breadcrumb = [] }) {
  const { toggleSidebar, isCollapsed, toggleCollapsed } = useSidebar();

  return (
    <header className="dashboard-header h-16 w-full max-w-full justify-between gap-3 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 border-b border-slate-200/80 dark:border-zinc-800/80">
      {/* Left: Sidebar Toggle + Breadcrumb */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors border-0"
          aria-label="Ouvrir la barre latérale"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors border-0 cursor-pointer"
          aria-label={isCollapsed ? 'Ouvrir la barre latérale' : 'Fermer la barre latérale'}
          title={isCollapsed ? 'Ouvrir la barre latérale' : 'Fermer la barre latérale'}
        >
          {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        {breadcrumb.length > 0 && (
          <div className="hidden sm:block">
            <Breadcrumb items={breadcrumb} />
          </div>
        )}
      </div>

      {/* Center: Search input pill */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4">
        <div className="relative flex items-center w-full rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <Search className="h-4 w-4 shrink-0 text-slate-400 mr-2" />
          <input
            aria-label="Rechercher"
            placeholder="Rechercher..."
            className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Right: Tools & User */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <LanguageSelector />
        </div>
        <ThemeToggle />
        <NotificationDropdown />
        <div className="h-5 w-px bg-slate-200 dark:bg-zinc-800 hidden sm:block" />
        <UserMenu />
      </div>
    </header>
  );
}
