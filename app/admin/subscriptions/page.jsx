'use strict';

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CreditCard, Search, ArrowUpDown } from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PageHeader from '../../../components/dashboard/PageHeader';
import SearchBar from '../../../components/dashboard/SearchBar';
import DataTable from '../../../components/dashboard/DataTable';
import Pagination from '../../../components/dashboard/Pagination';
import Badge from '../../../components/ui/Badge';
import Avatar from '../../../components/ui/Avatar';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import subscriptionService from '../../../services/subscriptionService';
import { useToast } from '../../../contexts/ToastContext';

export default function AdminSubscriptionsPage() {
  const { showToast } = useToast();
  
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Change Plan Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [updating, setUpdating] = useState(false);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subscriptionService.getAllSubscriptions({ search, page, limit: 10 });
      if (res.success) {
        setSubs(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch {
      showToast('error', 'Erreur lors du chargement des abonnements.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const handleChangePlanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setUpdating(true);
    try {
      const res = await subscriptionService.adminChangePlan(selectedUserId, selectedPlan);
      if (res.success) {
        showToast('success', 'Plan d\'abonnement mis à jour avec succès.');
        setIsPlanModalOpen(false);
        fetchSubs(); // Refresh the list
      }
    } catch {
      showToast('error', 'Erreur lors du changement de plan.');
    } finally {
      setUpdating(false);
    }
  };

  const variantMap = { free: 'slate', starter: 'info', pro: 'purple', enterprise: 'warning' };

  const columns = [
    {
      key: 'user',
      label: 'Client',
      render: (v) => (
        <div className="flex items-center gap-3">
          <Avatar src={v?.avatar} firstname={v?.firstname} lastname={v?.lastname} size="sm" />
          <div>
            <p className="font-semibold text-slate-800 dark:text-white text-xs">{v ? `${v.firstname} ${v.lastname}` : 'Inconnu'}</p>
            <p className="text-[10px] text-slate-500">{v?.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (v) => <Badge variant={variantMap[v] || 'slate'}>{v}</Badge>
    },
    {
      key: 'price',
      label: 'Prix Mensuel',
      render: (v, row) => `${Number(v).toFixed(2)} ${row.currency || 'EUR'}`
    },
    {
      key: 'startDate',
      label: 'Date de début',
      render: (v) => new Date(v).toLocaleDateString('fr-FR')
    },
    {
      key: 'endDate',
      label: 'Date de fin',
      render: (v) => v ? new Date(v).toLocaleDateString('fr-FR') : 'Jamais'
    },
    {
      key: 'status',
      label: 'Statut',
      render: (v) => <Badge variant={v === 'active' ? 'success' : 'slate'}>{v}</Badge>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => {
            setSelectedUserId(row.userId || row.user?.id);
            setSelectedPlan(row.plan);
            setIsPlanModalOpen(true);
          }}
        >
          Changer le plan
        </Button>
      )
    }
  ];

  const planOptions = [
    { value: 'free', label: 'Gratuit (Free)' },
    { value: 'starter', label: 'Starter (9.99 €)' },
    { value: 'pro', label: 'Pro (19.99 €)' },
    { value: 'enterprise', label: 'Enterprise (49.99 €)' }
  ];

  return (
    <DashboardLayout breadcrumb={[{ label: 'Administration', path: '/admin' }, { label: 'Abonnements' }]}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader title="Suivi des Abonnements" description="Supervisez les abonnements clients et les formules actives sur la plateforme." />

        <SearchBar
          search={search}
          setSearch={(v) => { setSearch(v); setPage(1); }}
          placeholder="Filtrer les abonnements par nom ou email..."
        />

        <DataTable
          columns={columns}
          data={subs}
          loading={loading}
          keyField="id"
          emptyState="Aucun abonnement trouvé."
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Change Plan Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Changer l'abonnement du client"
      >
        <form onSubmit={handleChangePlanSubmit} className="space-y-4">
          <Select
            label="Choisir la nouvelle formule"
            options={planOptions}
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsPlanModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" loading={updating}>
              Confirmer le changement
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
