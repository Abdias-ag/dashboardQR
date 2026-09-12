'use strict';

import React from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Navbar from '../components/dashboard/Navbar';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { useSidebar } from '../app/contexts/SidebarContext';

export default function DashboardLayout({ children, breadcrumb = [] }) {
  const { isCollapsed, isOpen, closeSidebar } = useSidebar();

  return (
    <div className={`dashboard-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity cursor-pointer"
        />
      )}

      <Sidebar />

      <div className="dashboard-main">
        <Navbar breadcrumb={breadcrumb} />

        <main className="dashboard-content">
          <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-6">
            {children}
          </div>
          <ScrollToTopButton />
        </main>
      </div>
    </div>
  );
}
