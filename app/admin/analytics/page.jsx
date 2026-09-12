'use strict';

'use client';

import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { BarChart3, Globe, Users, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PageHeader from '../../../components/dashboard/PageHeader';
import ChartCard from '../../../components/dashboard/ChartCard';
import StatsCard from '../../../components/dashboard/StatsCard';
import Loader from '../../../components/ui/Loader';
import Card from '../../../components/ui/Card';
import analyticsService from '../../../services/analyticsService';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getAdminStats()
      .then(res => { if (res.success) setStats(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loader size="lg" /></DashboardLayout>;

  return (
    <DashboardLayout breadcrumb={[{ label: 'Administration', path: '/admin' }, { label: 'Statistiques' }]}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader title="Statistiques Globales" description="Analyses de trafic, redirections et comportement utilisateur de la plateforme." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Redirections"
            value={stats.totalScans?.toLocaleString() || '0'}
            icon={TrendingUp}
            description="Trafic cumulé"
            variant="indigo"
          />
          <StatsCard
            title="Comptes Inscrits"
            value={stats.totalUsers?.toLocaleString() || '0'}
            icon={Users}
            description="Utilisateurs totaux"
            variant="purple"
          />
          <StatsCard
            title="Nouveaux inscrits / 7 jours"
            value={`+${stats.newUsersWeek}`}
            icon={Users}
            description="Croissance utilisateurs"
            variant="green"
          />
        </div>

        {/* Global timeline */}
        <ChartCard title="Activité des scans globaux" subtitle="30 derniers jours">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.scansByDay || []}>
              <defs>
                <linearGradient id="adminScansColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#adminScansColor)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Countries chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title="Répartition par pays" subtitle="Pays d'origine des scans détectés">
            {stats.scansByCountry?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.scansByCountry} layout="vertical">
                  <XAxis type="number" stroke="#475569" fontSize={9} />
                  <YAxis dataKey="country" type="category" stroke="#475569" fontSize={10} width={60} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '11px' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {stats.scansByCountry.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-xs text-slate-500">Pas de données</div>}
          </ChartCard>

          <Card className="flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Analyse des Données</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Le volume d'activité de scan est mesuré en temps réel à chaque fois qu'un code QR dynamique est scanné et redirigé par le routeur du serveur backend.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Le filtrage IP automatique géolocalise la source pour fournir la répartition par pays, protégeant l'anonymat individuel des utilisateurs.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/60 text-xs text-slate-500">
              Système de tracking mis à jour : Temps Réel (détection automatique)
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
