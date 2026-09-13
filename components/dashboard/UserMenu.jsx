'use strict';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../ui/Avatar';
import authService from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const ref = useRef(null);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    showToast('info', 'Vous avez été déconnecté.');
    window.location.replace('/login');
  };

  const menuItems = [
    { label: 'Mon Profil', icon: User, path: '/profile' },
    { label: 'Paramètres', icon: Settings, path: '/settings' },
    ...(user?.role === 'admin' ? [{ label: 'Administration', icon: ShieldCheck, path: '/admin' }] : []),
  ];

  const displayName = user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() : 'Admin System';
  const displayEmail = user?.email || 'admin@qr-platform.com';

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-1 pr-2 sm:pr-3 transition-all hover:bg-slate-100 dark:hover:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 cursor-pointer bg-white dark:bg-zinc-900"
      >
        <Avatar src={user?.avatar} firstname={user?.firstname || 'Admin'} lastname={user?.lastname || 'System'} size="sm" />
        <div className="hidden min-w-0 max-w-[170px] text-left md:block">
          <p className="truncate text-xs font-semibold text-slate-800 dark:text-white leading-tight">
            {displayEmail}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-56 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{displayEmail}</p>
            </div>
            <div className="p-1.5 space-y-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => { setOpen(false); router.push(item.path); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-all cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="p-1.5 border-t border-slate-200 dark:border-zinc-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
