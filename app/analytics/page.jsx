'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { BarChart3, Globe, Tablet, Laptop, Eye, QrCode } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/dashboard/PageHeader';
import ChartCard from '../../components/dashboard/ChartCard';
import StatsCard from '../../components/dashboard/StatsCard';
import Loader from '../../components/ui/Loader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import qrService from '../../services/qrService';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } }
};

export default function AnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrIdFromUrl = searchParams.get('qr');

  const [qrs, setQrs] = useState([]);
  const [selectedQrId, setSelectedQrId] = useState(qrIdFromUrl || '');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    qrService.getQrCodes({ limit: 100 })
      .then(res => {
        if (res.success) {
          setQrs(res.data);
          if (!selectedQrId && res.data.length > 0) setSelectedQrId(res.data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedQrId) return;
    setLoading(true);
    qrService.getAnalytics(selectedQrId)
      .then(res => { if (res.success) setAnalytics(res.data); else setAnalytics(null); })
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, [selectedQrId]);

  const qrSelector = qrs.length > 0 && (
    <select
      value={selectedQrId}
      onChange={(e) => { setSelectedQrId(e.target.value); router.replace(`/analytics?qr=${e.target.value}`); }}
      className="bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
    >
      {qrs.map(qr => <option key={qr.id} value={qr.id}>{qr.name} ({qr.type})</option>)}
    </select>
  );

  return (
    <DashboardLayout breadcrumb={[{ label: 'Analytics' }]}>
      <div className="w-full space-y-4 sm:space-y-6">
        <PageHeader
          title="Analytics"
          description="Analyse détaillée et géolocalisation des scans en temps réel."
          actions={qrSelector}
        />

        {loading ? <Loader size="md" /> : !analytics ? (
          <Card>
            <div className="py-16 text-center">
              <QrCode className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Aucune donnée de scan disponible pour ce QR Code.</p>
            </div>
          </Card>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {/* Overview Banner */}
            <motion.div variants={itemVariants}>
              <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
                <div>
                  <h2 className="text-xl font-bold text-white">{analytics.qrCode.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="info">{analytics.qrCode.type}</Badge>
                    <span className="text-xs text-slate-500 font-mono">/{analytics.qrCode.slug}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-indigo-400">{analytics.qrCode.scanCount?.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 block uppercase font-bold tracking-widest mt-0.5">Scans Totaux</span>
                </div>
              </Card>
            </motion.div>

            {/* Scans Timeline */}
            <motion.div variants={itemVariants}>
              <ChartCard title="Évolution des scans" subtitle="30 derniers jours">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.scansByDay}>
                    <defs>
                      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#grad1)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </motion.div>

            {/* Grid: Pays, Devices, Browsers */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Top Pays */}
              <ChartCard title="Top Pays" subtitle={`${analytics.scansByCountry?.length || 0} pays détectés`}>
                {analytics.scansByCountry?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.scansByCountry} layout="vertical">
                      <XAxis type="number" stroke="#475569" fontSize={9} />
                      <YAxis dataKey="country" type="category" stroke="#475569" fontSize={10} width={60} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '11px' }} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {analytics.scansByCountry.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-xs text-slate-500">Pas de données</div>}
              </ChartCard>

              {/* Appareils */}
              <ChartCard title="Appareils" subtitle="Répartition des types">
                {analytics.scansByDevice?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.scansByDevice} dataKey="count" nameKey="device" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {analytics.scansByDevice.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-xs text-slate-500">Pas de données</div>}
              </ChartCard>

              {/* Navigateurs */}
              <ChartCard title="Navigateurs" subtitle="Top navigateurs utilisés">
                {analytics.scansByBrowser?.length > 0 ? (
                  <div className="h-full overflow-y-auto space-y-2 pr-1">
                    {analytics.scansByBrowser.map((b, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-300 font-medium truncate">{b.browser}</span>
                            <span className="text-xs text-slate-500 shrink-0 ml-2">{b.count}</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${analytics.scansByBrowser[0]?.count > 0 ? (b.count / analytics.scansByBrowser[0].count) * 100 : 0}%`,
                                background: COLORS[i % COLORS.length]
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="h-full flex items-center justify-center text-xs text-slate-500">Pas de données</div>}
              </ChartCard>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
