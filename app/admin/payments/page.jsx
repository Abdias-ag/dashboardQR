'use strict';

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DollarSign, Download, Eye, ExternalLink } from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PageHeader from '../../../components/dashboard/PageHeader';
import SearchBar from '../../../components/dashboard/SearchBar';
import DataTable from '../../../components/dashboard/DataTable';
import Pagination from '../../../components/dashboard/Pagination';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';
import subscriptionService from '../../../services/subscriptionService';
import { useToast } from '../../../contexts/ToastContext';

export default function AdminPaymentsPage() {
  const { showToast } = useToast();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subscriptionService.getAllSubscriptions({ search, page, limit: 10 });
      if (res.success) {
        // En filtrant ou affichant toutes les transactions valides
        setPayments(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch {
      showToast('error', 'Erreur lors du chargement des transactions.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleDownloadInvoice = (row) => {
    showToast('info', `Téléchargement de la facture PDF #${row.transactionId?.slice(-6) || 'N/A'}`);
  };

  const columns = [
    {
      key: 'transactionId',
      label: 'ID Transaction',
      render: (v) => <span className="font-mono text-xs text-white">#TXN-{v?.slice(-8).toUpperCase() || 'SIMULATED'}</span>
    },
    {
      key: 'user',
      label: 'Client',
      render: (v) => (
        <div className="flex items-center gap-3">
          <Avatar src={v?.avatar} firstname={v?.firstname} lastname={v?.lastname} size="sm" />
          <div>
            <p className="font-semibold text-white text-xs">{v ? `${v.firstname} ${v.lastname}` : 'Inconnu'}</p>
            <p className="text-[10px] text-slate-500">{v?.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Montant',
      render: (v, row) => `${Number(v).toFixed(2)} ${row.currency || 'EUR'}`
    },
    {
      key: 'paymentMethod',
      label: 'Méthode',
      render: (v) => <span className="uppercase text-xs font-semibold">{v}</span>
    },
    {
      key: 'startDate',
      label: 'Date d\'effet',
      render: (v) => new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    {
      key: 'status',
      label: 'Statut',
      render: (v) => <Badge variant={v === 'active' ? 'success' : 'slate'}>{v === 'active' ? 'complété' : v}</Badge>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={Download} onClick={() => handleDownloadInvoice(row)}>
            Facture
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout breadcrumb={[{ label: 'Administration', path: '/admin' }, { label: 'Paiements' }]}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader title="Registre des Transactions" description="Suivez toutes les transactions et factures de la plateforme." />

        <SearchBar
          search={search}
          setSearch={(v) => { setSearch(v); setPage(1); }}
          placeholder="Filtrer par transaction, email..."
        />

        <DataTable
          columns={columns}
          data={payments}
          loading={loading}
          keyField="id"
          emptyState="Aucun paiement enregistré."
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </DashboardLayout>
  );
}
