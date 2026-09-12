'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, XCircle, Gift } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/dashboard/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/dashboard/EmptyState';
import notificationService from '../../services/notificationService';
import { useToast } from '../../contexts/ToastContext';

const TYPE_CONFIG = {
  info: { icon: Info, color: 'text-indigo-400', bg: 'bg-indigo-500/10', variant: 'info' },
  success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', variant: 'success' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', variant: 'warning' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', variant: 'danger' },
  promo: { icon: Gift, color: 'text-purple-400', bg: 'bg-purple-500/10', variant: 'purple' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      if (res.success) setNotifications(res.data || []);
    } catch { showToast('error', 'Impossible de charger les notifications.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { showToast('error', 'Erreur.'); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('success', 'Toutes les notifications marquées comme lues.');
    } catch { showToast('error', 'Erreur.'); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      showToast('success', 'Notification supprimée.');
    } catch { showToast('error', 'Erreur lors de la suppression.'); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout breadcrumb={[{ label: 'Notifications' }]}>
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Notifications"
          description="Toutes vos alertes et messages importants."
          actions={
            unreadCount > 0 && (
              <Button variant="secondary" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
                Tout marquer comme lu ({unreadCount})
              </Button>
            )
          }
        />

        {loading ? <Loader /> : notifications.length === 0 ? (
          <Card>
            <EmptyState icon={Bell} title="Aucune notification" description="Vous n'avez aucune notification pour le moment." />
          </Card>
        ) : (
          <Card className="p-0 divide-y divide-slate-800/60">
            <AnimatePresence>
              {notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                const Icon = config.icon;
                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`flex items-start gap-4 p-5 transition-colors hover:bg-slate-900/40 ${!n.isRead ? 'bg-indigo-950/10' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${config.bg}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="text-sm font-bold text-white">{n.title}</h4>
                        <Badge variant={config.variant}>{n.type}</Badge>
                        {!n.isRead && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{n.message}</p>
                      <p className="text-[11px] text-slate-600 mt-2 font-mono">
                        {new Date(n.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition-colors whitespace-nowrap"
                        >
                          Marquer lu
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
