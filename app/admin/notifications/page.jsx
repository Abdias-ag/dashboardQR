'use strict';

'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Send, User } from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PageHeader from '../../../components/dashboard/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import notificationService from '../../../services/notificationService';
import userService from '../../../services/userService';
import { useToast } from '../../../contexts/ToastContext';

export default function AdminNotificationsPage() {
  const { showToast } = useToast();
  
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sending, setSending] = useState(false);

  // Form states
  const [targetUserId, setTargetUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [actionUrl, setActionUrl] = useState('');
  const [actionLabel, setActionLabel] = useState('');

  useEffect(() => {
    userService.getAllUsers({ limit: 100 })
      .then(res => {
        if (res.success) {
          setUsers(res.data || []);
          if (res.data?.length > 0) setTargetUserId(res.data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!targetUserId) {
      showToast('error', 'Veuillez sélectionner un utilisateur cible.');
      return;
    }
    if (!title.trim() || !message.trim()) {
      showToast('error', 'Le titre et le message sont requis.');
      return;
    }

    setSending(true);
    try {
      const res = await notificationService.createAdminNotification({
        userId: Number(targetUserId),
        title,
        message,
        type,
        actionUrl: actionUrl || null,
        actionLabel: actionLabel || null,
      });
      if (res.success) {
        showToast('success', 'Notification envoyée avec succès.');
        setTitle('');
        setMessage('');
        setActionUrl('');
        setActionLabel('');
      }
    } catch {
      showToast('error', 'Erreur lors de l\'envoi de la notification.');
    } finally {
      setSending(false);
    }
  };

  const userOptions = users.map(u => ({
    value: u.id,
    label: `${u.firstname} ${u.lastname} (${u.email})`
  }));

  const notificationTypes = [
    { value: 'info', label: 'ℹ️ Info' },
    { value: 'success', label: '✅ Succès' },
    { value: 'warning', label: '⚠️ Avertissement' },
    { value: 'error', label: '❌ Erreur' },
    { value: 'promo', label: '🎁 Promotion / Offre' },
  ];

  return (
    <DashboardLayout breadcrumb={[{ label: 'Administration', path: '/admin' }, { label: 'Notifications' }]}>
      <div className="max-w-3xl mx-auto space-y-6">
        <PageHeader title="Créateur de Notification" description="Envoyez des alertes ou messages ciblés à vos utilisateurs directement sur leur dashboard." />

        <Card>
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-800/60">
            <Bell className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Créer une alerte système</h3>
          </div>

          {loadingUsers ? (
            <div className="text-center py-8 text-xs text-slate-500">Chargement de la liste des utilisateurs...</div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              <Select
                label="Sélectionner l'utilisateur cible"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                options={userOptions}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Titre du message"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Maintenance système planifiée"
                  required
                />
                <Select
                  label="Type de notification"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  options={notificationTypes}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Contenu du message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-white/5 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                  placeholder="Écrivez le message de notification ici..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Lien d'action (optionnel URL)"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://example.com/target"
                />
                <Input
                  label="Texte du bouton d'action (optionnel)"
                  value={actionLabel}
                  onChange={(e) => setActionLabel(e.target.value)}
                  placeholder="Ex: En savoir plus"
                />
              </div>

              <div className="pt-4 border-t border-slate-800/40 flex justify-end">
                <Button type="submit" icon={Send} loading={sending}>
                  Envoyer la notification
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
