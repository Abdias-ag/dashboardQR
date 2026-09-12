'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, History, Sparkles, Loader2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/dashboard/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/dashboard/DataTable';
import subscriptionService from '../../services/subscriptionService';
import { useToast } from '../../contexts/ToastContext';

const PLANS = [
  { id: 'free', name: 'Gratuit', price: '0', limit: '5 QR codes', scans: '500 scans/mois', color: 'slate', features: ['Couleurs personnalisées', 'Tracking basique'] },
  { id: 'starter', name: 'Starter', price: '9.99', limit: '20 QR codes', scans: '2 000 scans/mois', color: 'indigo', features: ['Export PNG/SVG', 'Support email'] },
  { id: 'pro', name: 'Pro', price: '19.99', limit: '50 QR codes', scans: '10 000 scans/mois', color: 'purple', features: ['Logos personnalisés', 'Tracking avancé', 'Support prioritaire'] },
  { id: 'enterprise', name: 'Enterprise', price: '49.99', limit: 'Illimité', scans: 'Illimités', color: 'yellow', features: ['API intégration', 'Marque blanche', 'Support 24/7'] },
];

const variantMap = { free: 'slate', starter: 'info', pro: 'purple', enterprise: 'warning' };

export default function SubscriptionsPage() {
  const [currentSub, setCurrentSub] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      const [subRes, histRes] = await Promise.all([
        subscriptionService.getMySubscription(),
        subscriptionService.getSubscriptionHistory(),
      ]);
      if (subRes.success) setCurrentSub(subRes.data);
      if (histRes.success) setHistory(histRes.data || []);
    } catch { showToast('error', 'Erreur lors du chargement.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpgrade = async (planId) => {
    setUpdatingId(planId);
    try {
      const res = await subscriptionService.upgradePlan({
        plan: planId,
        paymentMethod: 'stripe',
        transactionId: `txn_sim_${Date.now()}`,
      });
      if (res.success) {
        showToast('success', `Vous êtes maintenant sur le plan ${planId.toUpperCase()} !`);
        await fetchData();
      }
    } catch { showToast('error', 'Erreur lors du changement de plan.'); }
    finally { setUpdatingId(''); }
  };

  const historyColumns = [
    { key: 'plan', label: 'Plan', render: (v) => <span className="capitalize font-semibold text-white">{v}</span> },
    { key: 'price', label: 'Prix', render: (v, row) => `${v} ${row.currency || 'EUR'}` },
    { key: 'paymentMethod', label: 'Méthode', render: (v) => <span className="uppercase text-xs">{v}</span> },
    { key: 'startDate', label: 'Date', render: (v) => new Date(v).toLocaleDateString('fr-FR') },
    { key: 'status', label: 'Statut', render: (v) => <Badge variant={v === 'active' ? 'success' : 'slate'}>{v}</Badge> },
  ];

  return (
    <DashboardLayout breadcrumb={[{ label: 'Abonnements' }]}>
      <div className="max-w-6xl mx-auto space-y-8">
        <PageHeader title="Abonnements" description="Gérez votre formule SaaS et consultez votre historique." />

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
        ) : (
          <>
            {/* Current Plan */}
            <Card className="relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Plan Actif</span>
                  </div>
                  <h2 className="text-3xl font-black text-white capitalize">
                    {currentSub?.plan || 'Gratuit'}
                  </h2>
                  <div className="flex items-center gap-3">
                    <Badge variant={currentSub?.status === 'active' ? 'success' : 'slate'}>
                      {currentSub?.status === 'active' ? 'Actif' : currentSub?.status || 'Inactif'}
                    </Badge>
                    {currentSub?.endDate && (
                      <span className="text-xs text-slate-500">
                        Renouvellement : {new Date(currentSub.endDate).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-white">{currentSub?.price || '0'}<span className="text-lg text-slate-400">€</span></span>
                  <span className="text-xs text-slate-500 block mt-1">/ mois</span>
                </div>
              </div>
            </Card>

            {/* Plans Grid */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Changer de formule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {PLANS.map((plan) => {
                  const isCurrent = currentSub?.plan === plan.id || (!currentSub && plan.id === 'free');
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative glass border rounded-3xl p-5 flex flex-col justify-between transition-all ${
                        isCurrent ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/5 hover:border-slate-700'
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                          Actuel
                        </span>
                      )}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-white text-sm">{plan.name}</h4>
                          <Badge variant={variantMap[plan.id]}>{plan.id}</Badge>
                        </div>
                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-3xl font-black text-white">{plan.price}€</span>
                          <span className="text-slate-500 text-xs">/ mois</span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-400 mb-4">
                          <li className="font-semibold text-slate-300">{plan.limit}</li>
                          <li className="font-semibold text-slate-300">{plan.scans}</li>
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button
                        variant={isCurrent ? 'ghost' : 'primary'}
                        size="sm"
                        className="w-full"
                        disabled={isCurrent}
                        loading={updatingId === plan.id}
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        {isCurrent ? 'Plan actuel' : 'Choisir'}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* History */}
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Historique de facturation</h3>
              </div>
              <DataTable
                columns={historyColumns}
                data={history}
                loading={false}
                emptyState="Aucune transaction trouvée."
                keyField="id"
              />
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
