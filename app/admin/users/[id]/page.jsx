'use strict';

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, QrCode, CreditCard, Shield, Calendar, Mail, Phone, ToggleLeft, ToggleRight, Trash2, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import PageHeader from '../../../../components/dashboard/PageHeader';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/Button';
import Loader from '../../../../components/ui/Loader';
import Modal from '../../../../components/ui/Modal';
import Select from '../../../../components/ui/Select';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';
import userService from '../../../../services/userService';
import qrService from '../../../../services/qrService';
import subscriptionService from '../../../../services/subscriptionService';
import { useToast } from '../../../../contexts/ToastContext';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const userId = params.id;

  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Change Plan Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [updatingPlan, setUpdatingPlan] = useState(false);

  // Delete QR Confirm State
  const [deleteQrId, setDeleteQrId] = useState(null);
  const [deletingQr, setDeletingQr] = useState(false);

  const fetchUserDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getUserById(userId);
      if (res.success) {
        setUserDetail(res.data);
        setSelectedPlan(res.data.plan);
      } else {
        showToast('error', 'Utilisateur introuvable.');
        router.push('/admin/users');
      }
    } catch {
      showToast('error', 'Erreur lors du chargement des détails.');
    } finally {
      setLoading(false);
    }
  }, [userId, router, showToast]);

  useEffect(() => {
    if (userId) fetchUserDetail();
  }, [userId, fetchUserDetail]);

  const handleUpdateStatus = async (nextStatus) => {
    setUpdatingId(userId);
    try {
      const res = await userService.updateUserStatus(userId, nextStatus);
      if (res.success) {
        setUserDetail(prev => ({ ...prev, status: res.data.status }));
        showToast('success', `Statut mis à jour : ${nextStatus.toUpperCase()}`);
      }
    } catch {
      showToast('error', 'Erreur lors de la modification.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChangePlanSubmit = async (e) => {
    e.preventDefault();
    setUpdatingPlan(true);
    try {
      const res = await subscriptionService.adminChangePlan(userId, selectedPlan);
      if (res.success) {
        showToast('success', 'Plan d\'abonnement mis à jour avec succès.');
        setIsPlanModalOpen(false);
        fetchUserDetail(); // Reload data
      }
    } catch {
      showToast('error', 'Erreur lors du changement de plan.');
    } finally {
      setUpdatingPlan(false);
    }
  };

  const handleToggleQr = async (qrId, currentActive) => {
    try {
      const res = await qrService.adminToggleQrCode(qrId);
      if (res.success) {
        setUserDetail(prev => ({
          ...prev,
          qrCodes: prev.qrCodes.map(q => q.id === qrId ? { ...q, isActive: res.data.isActive } : q)
        }));
        showToast('success', 'Statut du QR code mis à jour.');
      }
    } catch {
      showToast('error', 'Erreur lors de la modification du QR Code.');
    }
  };

  const handleDeleteQr = async () => {
    if (!deleteQrId) return;
    setDeletingQr(true);
    try {
      const res = await qrService.adminDeleteQrCode(deleteQrId);
      if (res.success) {
        setUserDetail(prev => ({
          ...prev,
          qrCodes: prev.qrCodes.filter(q => q.id !== deleteQrId)
        }));
        showToast('success', 'QR Code supprimé définitivement.');
      }
    } catch {
      showToast('error', 'Erreur lors de la suppression.');
    } finally {
      setDeletingQr(false);
      setDeleteQrId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader size="lg" />
      </DashboardLayout>
    );
  }

  const statusColors = { active: 'success', inactive: 'slate', banned: 'danger' };
  const planColors = { free: 'slate', starter: 'info', pro: 'purple', enterprise: 'warning' };

  return (
    <DashboardLayout breadcrumb={[{ label: 'Administration', path: '/admin' }, { label: 'Utilisateurs', path: '/admin/users' }, { label: `${userDetail?.firstname} ${userDetail?.lastname}` }]}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <PageHeader
            title={`${userDetail?.firstname} ${userDetail?.lastname}`}
            description="Vue détaillée du compte client, de ses QR codes et de sa facturation."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User profile details Card */}
          <Card className="lg:col-span-1 space-y-6">
            <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-500/10 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 text-3xl font-bold mb-3 uppercase shadow-inner">
                {userDetail?.firstname?.[0]}{userDetail?.lastname?.[0]}
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">{userDetail?.firstname} {userDetail?.lastname}</h3>
              <p className="text-xs text-slate-500 mt-1">{userDetail?.email}</p>
              <div className="flex gap-2 mt-4">
                <Badge variant={statusColors[userDetail?.status] || 'slate'}>{userDetail?.status}</Badge>
                <Badge variant={planColors[userDetail?.plan] || 'slate'}>{userDetail?.plan}</Badge>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">Informations Générales</h4>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{userDetail?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{userDetail?.phone || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Inscrit le {new Date(userDetail?.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Rôle : <span className="font-semibold text-slate-700 dark:text-slate-200">{userDetail?.role}</span></span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] mb-2">Actions Admin</h4>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold"
                  onClick={() => setIsPlanModalOpen(true)}
                >
                  Changer la formule d'abonnement
                </Button>
                {userDetail?.status === 'active' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-slate-600 border-slate-200 hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-800/50"
                    onClick={() => handleUpdateStatus('inactive')}
                    disabled={updatingId === userId}
                  >
                    Désactiver le compte
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-500/10"
                    onClick={() => handleUpdateStatus('active')}
                    disabled={updatingId === userId}
                  >
                    Réactiver le compte
                  </Button>
                )}
                {userDetail?.status === 'banned' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-500/10"
                    onClick={() => handleUpdateStatus('active')}
                    disabled={updatingId === userId}
                  >
                    Débannir
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full text-xs font-semibold"
                    onClick={() => handleUpdateStatus('banned')}
                    disabled={updatingId === userId}
                  >
                    Bannir l'utilisateur
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* User's QR Codes List */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-orange-500" />
                Codes QR de l'utilisateur ({userDetail?.qrCodes?.length || 0})
              </h3>
              <div className="space-y-3">
                {!userDetail?.qrCodes || userDetail.qrCodes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">Aucun QR code créé par cet utilisateur.</p>
                ) : (
                  userDetail.qrCodes.map((qr) => (
                    <div key={qr.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-100 dark:border-zinc-800/80 rounded-2xl gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 dark:text-white text-xs">{qr.name}</span>
                          <Badge variant={qr.isActive ? 'success' : 'slate'}>{qr.isActive ? 'actif' : 'inactif'}</Badge>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">/{qr.slug} • Type : {qr.type}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="text-slate-600 dark:text-slate-300">{qr.scanCount || 0} scans</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleQr(qr.id, qr.isActive)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            {qr.isActive ? <ToggleRight className="w-5 h-5 text-orange-500" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => setDeleteQrId(qr.id)}
                            className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Subscriptions history */}
            <Card className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" />
                Historique des Abonnements
              </h3>
              <div className="space-y-3">
                {!userDetail?.subscriptions || userDetail.subscriptions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">Aucun historique d'abonnement trouvé.</p>
                ) : (
                  userDetail.subscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 border border-slate-100 dark:border-zinc-800/80 rounded-2xl text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold capitalize text-slate-800 dark:text-white">{sub.plan}</span>
                          <Badge variant={sub.status === 'active' ? 'success' : 'slate'}>{sub.status}</Badge>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Début : {new Date(sub.startDate).toLocaleDateString('fr-FR')} • Fin : {sub.endDate ? new Date(sub.endDate).toLocaleDateString('fr-FR') : 'Sans expiration'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800 dark:text-white">{Number(sub.price).toFixed(2)} EUR</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{sub.paymentMethod}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Change Plan Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Modifier l'abonnement de l'utilisateur"
      >
        <form onSubmit={handleChangePlanSubmit} className="space-y-4">
          <Select
            label="Choisir le plan d'abonnement"
            options={[
              { value: 'free', label: 'Gratuit (Free)' },
              { value: 'starter', label: 'Starter (9.99 €)' },
              { value: 'pro', label: 'Pro (19.99 €)' },
              { value: 'enterprise', label: 'Enterprise (49.99 €)' }
            ]}
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsPlanModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" loading={updatingPlan}>
              Confirmer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete QR Code Confirm */}
      <ConfirmDialog
        isOpen={!!deleteQrId}
        onClose={() => setDeleteQrId(null)}
        onConfirm={handleDeleteQr}
        title="Supprimer définitivement le QR Code"
        message="Êtes-vous certain ? Cette suppression effacera à jamais ce QR Code et toutes ses données analytiques associées."
        confirmText="Confirmer"
        loading={deletingQr}
      />
    </DashboardLayout>
  );
}
