'use strict';

'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, Download, CreditCard, ShieldCheck, HelpCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/dashboard/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/dashboard/DataTable';
import Loader from '../../components/ui/Loader';
import subscriptionService from '../../services/subscriptionService';
import { useToast } from '../../contexts/ToastContext';

export default function BillingPage() {
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, histRes] = await Promise.all([
          subscriptionService.getMySubscription(),
          subscriptionService.getSubscriptionHistory(),
        ]);
        if (subRes.success) setCurrentSub(subRes.data);
        if (histRes.success) setHistory(histRes.data || []);
      } catch (err) {
        showToast('error', 'Erreur lors de la récupération des factures.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownloadInvoice = (invoice) => {
    showToast('info', `Téléchargement de la facture #${invoice.transactionId?.slice(-6) || 'N/A'} au format PDF.`);
  };

  const columns = [
    {
      key: 'transactionId',
      label: 'N° Facture',
      render: (v) => <span className="font-mono text-xs text-white">#INV-{v?.slice(-6).toUpperCase() || 'XXXX'}</span>
    },
    {
      key: 'startDate',
      label: 'Date d\'émission',
      render: (v) => new Date(v).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (v) => <span className="capitalize font-semibold text-white">{v}</span>
    },
    {
      key: 'price',
      label: 'Montant',
      render: (v, row) => `${Number(v).toFixed(2)} ${row.currency || 'EUR'}`
    },
    {
      key: 'status',
      label: 'Statut',
      render: (v) => <Badge variant={v === 'active' ? 'success' : 'slate'}>{v === 'active' ? 'payé' : v}</Badge>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button variant="ghost" size="sm" icon={Download} onClick={() => handleDownloadInvoice(row)}>
          PDF
        </Button>
      )
    }
  ];

  return (
    <DashboardLayout breadcrumb={[{ label: 'Facturation' }]}>
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Factures & Paiements"
          description="Consultez l'historique de vos paiements et téléchargez vos justificatifs."
        />

        {loading ? (
          <Loader size="md" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Main Billing Table */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-indigo-400" /> Historique des factures
                  </h3>
                </div>
                <DataTable
                  columns={columns}
                  data={history}
                  loading={false}
                  emptyState="Aucune facture disponible."
                  keyField="id"
                />
              </Card>
            </div>

            {/* Side summary panel */}
            <div className="space-y-6">
              {/* Payment Method */}
              <Card className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-400" /> Mode de paiement
                </h3>
                <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Stripe Card</p>
                      <p className="text-[10px] text-slate-500">Paiement mensuel automatique</p>
                    </div>
                  </div>
                  <Badge variant="success">Par défaut</Badge>
                </div>
              </Card>

              {/* Secure guarantee */}
              <Card className="space-y-3 bg-indigo-600/5 border border-indigo-500/10">
                <div className="flex items-center gap-2 text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Sécurité SSL 256-bit</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tous les paiements et informations de facturation sont cryptés et traités de manière sécurisée par nos processeurs de paiement agréés PCI-DSS (Stripe, Paypal).
                </p>
              </Card>

              {/* Help support */}
              <Card className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <HelpCircle className="w-5 h-5 text-slate-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Besoin d'aide ?</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Pour toute question concernant la facturation, le remboursement ou le changement de plan, contactez notre équipe support :
                </p>
                <p className="text-xs font-semibold text-indigo-400">billing@qr-platform.com</p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
