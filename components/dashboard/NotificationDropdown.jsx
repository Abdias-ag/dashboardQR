'use strict';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../ui/Badge';
import notificationService from '../../services/notificationService';
import { useToast } from '../../contexts/ToastContext';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverUnread, setServerUnread] = useState(0);
  const ref = useRef(null);
  const { showToast } = useToast();

  const unread = serverUnread || notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data?.slice(0, 8) || []);
        setServerUnread(res.meta?.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setServerUnread(0);
      showToast('success', 'Toutes les notifications marquées comme lues.');
    } catch (e) {
      showToast('error', 'Erreur lors de la mise à jour.');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const typeColors = { success: 'success', error: 'danger', warning: 'warning', info: 'info', promo: 'purple' };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800/60 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-sm">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 w-80 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Notifications</h4>
                {unread > 0 && <Badge variant="info">{unread}</Badge>}
              </div>
              {unread > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors font-medium">
                  <CheckCheck className="w-3.5 h-3.5" /> Tout lire
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800">
              {loading ? (
                <div className="py-8 text-center text-slate-500 text-xs">Chargement...</div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">Aucune notification</div>
              ) : notifications.map(n => (
                <div key={n.id} className={`flex items-start gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-700'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{n.title}</p>
                      <Badge variant={typeColors[n.type] || 'slate'} className="shrink-0">{n.type}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(n.id, e)}
                    className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => { setOpen(false); window.location.href = '/notifications'; }}
                className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:underline transition-colors cursor-pointer py-1 font-semibold"
              >
                Voir toutes les notifications →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
