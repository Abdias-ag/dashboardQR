'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Globe, Clock, Calendar, Bell, Mail, Shield, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/dashboard/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import settingService from '../../services/settingService';
import { useToast } from '../../contexts/ToastContext';

const LANGUAGES = [
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'de', label: '🇩🇪 Deutsch' },
  { value: 'ar', label: '🇲🇦 العربية' },
  { value: 'pt', label: '🇧🇷 Português' },
];

const TIMEZONES = [
  { value: 'Europe/Paris', label: 'Europe/Paris (UTC+1/+2)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+0/+1)' },
  { value: 'America/New_York', label: 'America/New_York (UTC-5/-4)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-8/-7)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (UTC+4)' },
  { value: 'Africa/Casablanca', label: 'Africa/Casablanca (UTC+1)' },
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'JJ/MM/AAAA' },
  { value: 'MM/DD/YYYY', label: 'MM/JJ/AAAA' },
  { value: 'YYYY-MM-DD', label: 'AAAA-MM-JJ (ISO)' },
];

function ToggleSwitch({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-all cursor-pointer shrink-0 ${enabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    language: 'fr',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
  });

  useEffect(() => {
    settingService.getSettings()
      .then(res => { if (res.success && res.data) setSettings(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const res = await settingService.updateSettings({
        language: settings.language,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        weeklyReport: settings.weeklyReport,
      });
      if (res.success) showToast('success', 'Paramètres sauvegardés avec succès.');
    } catch {
      showToast('error', 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } }
  };

  return (
    <DashboardLayout breadcrumb={[{ label: 'Paramètres' }]}>
      <div className="max-w-3xl mx-auto space-y-6">
        <PageHeader
          title="Paramètres"
          description="Personnalisez votre expérience et vos préférences de notifications."
          actions={
            <Button onClick={handleSave} loading={saving}>
              Sauvegarder les changements
            </Button>
          }
        />

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
            {/* Langue & Région */}
            <motion.div variants={itemVariants}>
              <Card>
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800/60">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Langue & Région</h3>
                    <p className="text-xs text-slate-500">Personnalisez la langue et les formats d'affichage.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Langue"
                    value={settings.language}
                    onChange={(e) => set('language', e.target.value)}
                    options={LANGUAGES}
                  />
                  <Select
                    label="Fuseau horaire"
                    value={settings.timezone}
                    onChange={(e) => set('timezone', e.target.value)}
                    options={TIMEZONES}
                  />
                  <Select
                    label="Format de date"
                    value={settings.dateFormat}
                    onChange={(e) => set('dateFormat', e.target.value)}
                    options={DATE_FORMATS}
                  />
                </div>
              </Card>
            </motion.div>

            {/* Notifications */}
            <motion.div variants={itemVariants}>
              <Card>
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800/60">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                    <p className="text-xs text-slate-500">Gérez quand et comment vous recevez des alertes.</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-800/40">
                  <ToggleSwitch
                    enabled={settings.emailNotifications}
                    onChange={(v) => set('emailNotifications', v)}
                    label="Notifications par email"
                    description="Recevoir des alertes importantes par email."
                  />
                  <ToggleSwitch
                    enabled={settings.pushNotifications}
                    onChange={(v) => set('pushNotifications', v)}
                    label="Notifications push"
                    description="Activer les notifications dans le navigateur."
                  />
                  <ToggleSwitch
                    enabled={settings.weeklyReport}
                    onChange={(v) => set('weeklyReport', v)}
                    label="Rapport hebdomadaire"
                    description="Recevoir un résumé des scans chaque semaine."
                  />
                </div>
              </Card>
            </motion.div>

            {/* Sécurité */}
            <motion.div variants={itemVariants}>
              <Card>
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800/60">
                  <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Sécurité & Confidentialité</h3>
                    <p className="text-xs text-slate-500">Gérez la sécurité de votre compte.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button variant="secondary" size="sm" onClick={() => window.location.href = '/profile'}>
                    Changer mon mot de passe
                  </Button>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    Votre compte est protégé par JWT avec rotation de token.
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Danger Zone */}
            <motion.div variants={itemVariants}>
              <Card className="border-red-500/10 bg-red-950/5">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-red-500/10">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-400">Zone de danger</h3>
                    <p className="text-xs text-slate-500">Actions irréversibles sur votre compte.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    La suppression de votre compte effacera définitivement toutes vos données, QR codes et statistiques. Cette action est <strong className="text-red-400">irréversible</strong>.
                  </p>
                  <Button variant="danger" size="sm" onClick={() => window.location.href = '/profile#delete'}>
                    Supprimer mon compte
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
