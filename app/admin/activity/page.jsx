'use strict';

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { History, UserPlus, QrCode, BarChart3, Sparkles, Filter } from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PageHeader from '../../../components/dashboard/PageHeader';
import DataTable from '../../../components/dashboard/DataTable';
import Pagination from '../../../components/dashboard/Pagination';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Select from '../../../components/ui/Select';
import activityService from '../../../services/activityService';
import { useToast } from '../../../contexts/ToastContext';

export default function AdminActivityPage() {
  const { showToast } = useToast();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityService.getActivityLog({ type: typeFilter || undefined, limit: 100 });
      if (res.success) {
        setActivities(res.data);
        // Client-side pagination since logs are returning 100 max
        setTotalPages(Math.ceil(res.data.length / 10) || 1);
      }
    } catch {
      showToast('error', 'Erreur lors du chargement du journal d\'activité.');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, showToast]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const activityTypes = [
    { value: '', label: 'Tous les types' },
    { value: 'user_registered', label: 'Nouvelles Inscriptions' },
    { value: 'qr_created', label: 'Créations de QR Code' },
    { value: 'scan', label: 'Scans de QR Code' },
    { value: 'plan_changed', label: 'Changements d\'Abonnement' }
  ];

  const activityIcons = {
    user_registered: { icon: UserPlus, color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10' },
    qr_created: { icon: QrCode, color: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10' },
    scan: { icon: BarChart3, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10' },
    plan_changed: { icon: Sparkles, color: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-500/10' },
  };

  const columns = [
    {
      key: 'type',
      label: 'Événement',
      render: (v, row) => {
        const typeInfo = activityIcons[v] || { icon: History, color: 'text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-500/10' };
        const Icon = typeInfo.icon;
        return (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${typeInfo.color} shrink-0`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white text-xs">{row.label}</p>
              <p className="text-[10px] text-slate-500 capitalize">{v.replace('_', ' ')}</p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'description',
      label: 'Détails',
      render: (v) => <span className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">{v}</span>
    },
    {
      key: 'createdAt',
      label: 'Date & Heure',
      render: (v) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {new Date(v).toLocaleString('fr-FR', {
            dateStyle: 'short',
            timeStyle: 'short'
          })}
        </span>
      )
    }
  ];

  // Client side paginated subset
  const paginatedActivities = activities.slice((page - 1) * 10, page * 10);

  return (
    <DashboardLayout breadcrumb={[{ label: 'Administration', path: '/admin' }, { label: 'Journal d\'activité' }]}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Journal d'Activité de la Plateforme"
          description="Consultez l'historique complet des inscriptions, créations de QR codes, scans et abonnements."
        />

        <Card className="p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <Filter className="w-4 h-4 text-orange-500" />
            Filtrer par type d'action
          </div>
          <div className="w-full sm:w-64">
            <Select
              options={activityTypes}
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            />
          </div>
        </Card>

        <DataTable
          columns={columns}
          data={paginatedActivities}
          loading={loading}
          keyField="id"
          emptyState="Aucune activité enregistrée."
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </DashboardLayout>
  );
}
