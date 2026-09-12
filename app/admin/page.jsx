'use strict';

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, QrCode, BarChart3, CreditCard, DollarSign, History, ArrowRight, UserPlus, Sparkles, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/dashboard/PageHeader';
import StatsCard from '../../components/dashboard/StatsCard';
import ChartCard from '../../components/dashboard/ChartCard';
import Loader from '../../components/ui/Loader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import analyticsService from '../../services/analyticsService';
import activityService from '../../services/activityService';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getAdminStats(),
      activityService.getActivityLog({ limit: 5 })
    ])
      .then(([statsRes, activityRes]) => {
        if (statsRes.success) setStats(statsRes.data);
        if (activityRes.success) setRecentActivities(activityRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Loader size="lg" />
      </DashboardLayout>
    );
  }

  const activityIcons = {
    user_registered: { icon: UserPlus, color: 'text-green-500 bg-green-500/10' },
    qr_created: { icon: QrCode, color: 'text-orange-500 bg-orange-500/10' },
    scan: { icon: BarChart3, color: 'text-blue-500 bg-blue-500/10' },
    plan_changed: { icon: Sparkles, color: 'text-yellow-500 bg-yellow-500/10' },
  };

  return (
    <DashboardLayout breadcrumb={[{ label: 'Administration', path: '/admin' }, { label: 'Vue d\'ensemble' }]}>
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="Console d'Administration"
          description="Aperçu des performances globales, inscriptions et transactions de la plateforme."
        />

        {/* Global Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Utilisateurs"
            value={stats.totalUsers?.toLocaleString() || '0'}
            icon={Users}
            description={`${stats.activeUsers || 0} actifs sur la plateforme`}
            variant="indigo"
          />
          <StatsCard
            title="QR Codes"
            value={stats.totalQrCodes?.toLocaleString() || '0'}
            icon={QrCode}
            description="Générés sur la plateforme"
            variant="purple"
          />
          <StatsCard
            title="Scans Globaux"
            value={stats.totalScans?.toLocaleString() || '0'}
            icon={BarChart3}
            description="Redirections opérées"
            variant="green"
          />
          <StatsCard
            title="Désactivés"
            value={stats.inactiveUsers?.toLocaleString() || '0'}
            icon={ShieldAlert}
            description="Comptes suspendus ou inactifs"
            variant="red"
          />
          <StatsCard
            title="Abonnements"
            value={stats.totalSubscriptions?.toLocaleString() || '0'}
            icon={CreditCard}
            description="Clients payants actifs"
            variant="yellow"
          />
          <StatsCard
            title="Revenus SaaS"
            value={`${Number(stats.totalRevenue).toFixed(2)} €`}
            icon={DollarSign}
            description="Mensuels estimés"
            variant="red"
          />
        </div>

        {/* Area Chart */}
        <ChartCard title="Activité globale des scans" subtitle="Volume total des redirections de la plateforme (30 jours)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.scansByDay || []}>
              <defs>
                <linearGradient id="adminScans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" dark-stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#e2e8f0', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="count" stroke="#ea580c" strokeWidth={2.5} fillOpacity={1} fill="url(#adminScans)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Inscriptions & Journal summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              Nouvelles Inscriptions
            </h3>
            <div className="flex items-center gap-4 py-2">
              <span className="text-4xl font-extrabold text-orange-600 dark:text-orange-400">+{stats.newUsersWeek}</span>
              <div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Nouveaux comptes créés</p>
                <p className="text-[10px] text-slate-500">Au cours des 7 derniers jours</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-xs text-slate-500">Gerez les permissions et statuts</span>
              <a href="/admin/users">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Gérer les comptes <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <History className="w-5 h-5 text-orange-500" />
                Journal d'activité récent
              </span>
              <a href="/admin/activity">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Voir tout <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </a>
            </h3>

            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">Aucune activité récente enregistrée.</p>
              ) : (
                recentActivities.map((act, index) => {
                  const typeInfo = activityIcons[act.type] || { icon: History, color: 'text-slate-500 bg-slate-500/10' };
                  const Icon = typeInfo.icon;
                  return (
                    <div key={index} className="flex gap-3 text-xs items-start">
                      <div className={`p-1.5 rounded-lg shrink-0 ${typeInfo.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-800 dark:text-slate-200 font-medium leading-tight">
                          {act.description}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(act.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 flex flex-col justify-between h-full space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Abonnements SaaS</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Suivez les formules souscrites par les utilisateurs, ou changez manuellement leur plan d'abonnement.
              </p>
            </div>
            <a href="/admin/subscriptions" className="w-full">
              <Button variant="outline" size="sm" className="w-full justify-between">
                Gérer les abonnements <CreditCard className="w-4 h-4" />
              </Button>
            </a>
          </Card>

          <Card className="p-5 flex flex-col justify-between h-full space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Analytiques Globales</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Explorez des graphiques détaillés sur les pays, navigateurs et périphériques utilisés lors des scans.
              </p>
            </div>
            <a href="/admin/analytics" className="w-full">
              <Button variant="outline" size="sm" className="w-full justify-between">
                Consulter les rapports <BarChart3 className="w-4 h-4" />
              </Button>
            </a>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
