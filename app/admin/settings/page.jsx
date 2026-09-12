'use strict';

'use client';

import React, { useState } from 'react';
import { Settings, Shield, Server, Mail, HardDrive } from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PageHeader from '../../../components/dashboard/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../contexts/ToastContext';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [appName, setAppName] = useState('QR Platform');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [maxUpload, setMaxUpload] = useState('5');

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('success', 'Configurations globales enregistrées avec succès (simulation).');
    }, 800);
  };

  return (
    <DashboardLayout breadcrumb={[{ label: 'Administration', path: '/admin' }, { label: 'Paramètres' }]}>
      <div className="max-w-3xl mx-auto space-y-6">
        <PageHeader title="Paramètres Système" description="Configurez les paramètres globaux de la plateforme SaaS, du mailer et de l'infrastructure." />

        <form onSubmit={handleSave} className="space-y-6">
          {/* General Platform Details */}
          <Card>
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-800/60">
              <Settings className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Général</h3>
            </div>
            <Input
              label="Nom de l'application"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Ex: QR Platform"
              required
            />
          </Card>

          {/* Mail configuration */}
          <Card>
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-800/60">
              <Mail className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Serveur d'envoi SMTP (Email)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Hôte SMTP"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.example.com"
                required
              />
              <Input
                label="Port SMTP"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
                required
              />
            </div>
          </Card>

          {/* Security & uploads */}
          <Card>
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-800/60">
              <HardDrive className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Limites de Téléchargement & Fichiers</h3>
            </div>
            <Input
              label="Taille de fichier max autorisée (Mo)"
              type="number"
              value={maxUpload}
              onChange={(e) => setMaxUpload(e.target.value)}
              placeholder="5"
              required
            />
          </Card>

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Enregistrer la configuration globale
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
