'use strict';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, QrCode, PlusCircle, Camera, BarChart3, History,
  Bell, CreditCard, DollarSign, Settings, User, LogOut, X,
  Users, ShieldCheck, Globe, ChevronDown, ChevronRight,
  Layers, Scan
} from 'lucide-react';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import authService from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import { useSidebar } from '../app/contexts/SidebarContext';

const NavItem = ({ item, pathname, onClick }) => {
  const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
  const Icon = item.icon;

  return (
    <button
      onClick={() => onClick(item.path)}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left group ${
        isActive
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
          : 'hover:bg-slate-100 dark:hover:bg-zinc-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
      <span className="flex-1 truncate">{item.name}</span>
      {item.badge && (
        <Badge variant="info" className="shrink-0 text-[9px]">{item.badge}</Badge>
      )}
    </button>
  );
};

const NavSection = ({ title, items, pathname, onNavigate, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3.5 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
      >
        {title}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-1"
          >
            {items.map((item) => (
              <NavItem key={item.path} item={item} pathname={pathname} onClick={onNavigate} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);
  const { showToast } = useToast();
  const { isOpen, closeSidebar, isCollapsed } = useSidebar();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  const handleNavigate = (path) => router.push(path);

  const handleLogout = async () => {
    try { await authService.logout(); } catch (e) { /* silence */ }
    localStorage.clear();
    showToast('info', 'Déconnexion réussie.');
    router.push('/login');
  };

  const userNavSections = [
    {
      title: 'PRINCIPAL',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Mes QR Codes', icon: QrCode, path: '/my-qrcodes' },
        { name: 'Créer un QR', icon: PlusCircle, path: '/create-qr' },
        { name: 'Scanner', icon: Scan, path: '/scanner' },
      ]
    },
    {
      title: 'ANALYSE',
      items: [
        { name: 'Analytics', icon: BarChart3, path: '/analytics' },
        { name: 'Notifications', icon: Bell, path: '/notifications' },
      ]
    },
    {
      title: 'COMPTE',
      items: [
        { name: 'Abonnements', icon: CreditCard, path: '/subscriptions' },
        { name: 'Facturation', icon: DollarSign, path: '/billing' },
        { name: 'Paramètres', icon: Settings, path: '/settings' },
        { name: 'Mon Profil', icon: User, path: '/profile' },
      ]
    }
  ];

  const adminNavSections = [
    {
      title: 'ADMINISTRATION',
      items: [
        { name: 'Dashboard Admin', icon: LayoutDashboard, path: '/admin' },
        { name: 'Utilisateurs', icon: Users, path: '/admin/users' },
        { name: 'Activité', icon: History, path: '/admin/activity' },
        { name: 'Statistiques', icon: BarChart3, path: '/admin/analytics' },
        { name: 'Abonnements', icon: CreditCard, path: '/admin/subscriptions' },
        { name: 'Paiements', icon: DollarSign, path: '/admin/payments' },
        { name: 'Notifications', icon: Bell, path: '/admin/notifications' },
      ]
    }
  ];

  return (
    <aside className={`sidebar-container select-none hide-scrollbar flex flex-col ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Close button for mobile */}
      <button
        onClick={closeSidebar}
        className="absolute top-4 right-4 lg:hidden z-50 p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400"
        aria-label="Fermer la barre latérale"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Logo */}
      <div className="p-4 border-b border-slate-200 dark:border-zinc-800/60 shrink-0">
        <button
          onClick={() => { router.push('/dashboard'); closeSidebar(); }}
          className="flex items-center gap-3 cursor-pointer group w-full"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <h1 className="font-extrabold text-slate-900 dark:text-white tracking-tight text-sm truncate">QR Platform</h1>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full whitespace-nowrap inline-block">
              SaaS PRO
            </span>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-3 overflow-y-auto hide-scrollbar">
        {userNavSections.map((section) => (
          <NavSection
            key={section.title}
            title={section.title}
            items={section.items}
            pathname={pathname}
            onNavigate={(path) => { handleNavigate(path); closeSidebar(); }}
          />
        ))}

        {currentUser?.role === 'admin' && (
          <>
            <div className="h-px bg-slate-200 dark:bg-zinc-800 mx-2" />
            {adminNavSections.map((section) => (
              <NavSection
                key={section.title}
                title={section.title}
                items={section.items}
                pathname={pathname}
                onNavigate={(path) => { handleNavigate(path); closeSidebar(); }}
                defaultOpen={pathname.startsWith('/admin')}
              />
            ))}
          </>
        )}
      </nav>

      {/* User card at bottom */}
      <div className="p-3 border-t border-slate-200 dark:border-zinc-800/60 shrink-0">
        {currentUser && (
          <div className="flex items-center gap-2.5 mb-2 px-2 py-1">
            <Avatar src={currentUser.avatar} firstname={currentUser.firstname} lastname={currentUser.lastname} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{currentUser.firstname} {currentUser.lastname}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="truncate">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
