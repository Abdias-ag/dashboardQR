'use strict';

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Users, Trash2, ShieldAlert, CheckCircle, Ban, Search } from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PageHeader from '../../../components/dashboard/PageHeader';
import SearchBar from '../../../components/dashboard/SearchBar';
import DataTable from '../../../components/dashboard/DataTable';
import Pagination from '../../../components/dashboard/Pagination';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';
import userService from '../../../services/userService';
import { useToast } from '../../../contexts/ToastContext';

export default function AdminUsersPage() {
  const { showToast } = useToast();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Status modify
  const [updatingId, setUpdatingId] = useState(null);

  // Deletion confirm
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers({ search, page, limit: 10 });
      if (res.success) {
        setUsers(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch {
      showToast('error', 'Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdateStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUpdatingId(id);
    try {
      const res = await userService.updateUserStatus(id, nextStatus);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: res.data.status } : u));
        showToast('success', `Statut utilisateur modifié en ${nextStatus.toUpperCase()}.`);
      }
    } catch {
      showToast('error', 'Impossible de modifier le statut.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBanUser = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'banned' ? 'active' : 'banned';
    setUpdatingId(id);
    try {
      const res = await userService.updateUserStatus(id, nextStatus);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: res.data.status } : u));
        showToast('success', nextStatus === 'banned' ? 'Utilisateur banni.' : 'Utilisateur réactivé.');
      }
    } catch {
      showToast('error', 'Erreur lors de la modification.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleVerifyEmail = async (id) => {
    setUpdatingId(id);
    try {
      const res = await userService.verifyUserEmail(id);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, isVerified: true } : u));
        showToast('success', 'Adresse email confirmée.');
      }
    } catch {
      showToast('error', 'Impossible de confirmer l\'adresse email.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await userService.deleteUser(deleteId);
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== deleteId));
        showToast('success', 'Utilisateur supprimé avec succès.');
      }
    } catch {
      showToast('error', 'Erreur lors de la suppression.');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const statusColors = { active: 'success', inactive: 'slate', banned: 'danger' };

  const columns = [
    {
      key: 'user',
      label: 'Utilisateur',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} firstname={row.firstname} lastname={row.lastname} size="sm" />
          <div>
            <p className="font-semibold text-slate-800 dark:text-white text-xs">{row.firstname} {row.lastname}</p>
            <p className="text-[10px] text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (v) => <Badge variant={v === 'admin' ? 'purple' : 'slate'}>{v}</Badge>
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (v) => <span className="capitalize font-mono text-xs text-slate-800 dark:text-slate-200">{v}</span>
    },
    {
      key: 'status',
      label: 'Statut',
      render: (v) => <Badge variant={statusColors[v] || 'slate'}>{v}</Badge>
    },
    {
      key: 'createdAt',
      label: 'Date d\'inscription',
      render: (v) => new Date(v).toLocaleDateString('fr-FR')
    },
    {
      key: 'qrCreated',
      label: 'QR créés',
      render: (v) => (
        <div className="text-[10px] leading-5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
          <span className="font-semibold">J {v?.today || 0}</span>{' · '}
          <span className="font-semibold">M {v?.month || 0}</span>{' · '}
          <span className="font-semibold">A {v?.year || 0}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <a href={`/admin/users/${row.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-orange-500 hover:text-orange-400 font-semibold"
            >
              Détails
            </Button>
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVerifyEmail(row.id)}
            disabled={updatingId === row.id || row.isVerified}
            className={row.isVerified ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}
          >
            {row.isVerified ? 'Email confirmé' : 'Confirmer email'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUpdateStatus(row.id, row.status)}
            disabled={updatingId === row.id}
          >
            {row.status === 'active' ? 'Désactiver' : 'Activer'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBanUser(row.id, row.status)}
            disabled={updatingId === row.id}
            className="text-yellow-600 hover:text-yellow-500 dark:text-yellow-500 dark:hover:text-yellow-400"
          >
            {row.status === 'banned' ? 'Débannir' : 'Bannir'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(row.id)}
            disabled={updatingId === row.id}
            className="text-red-500 hover:text-red-400"
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout breadcrumb={[{ label: 'Administration', path: '/admin' }, { label: 'Utilisateurs' }]}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader title="Gestion des Utilisateurs" description="Activez, désactivez, bannissez ou supprimez les comptes des clients." />

        <SearchBar
          search={search}
          setSearch={(v) => { setSearch(v); setPage(1); }}
          placeholder="Rechercher par nom, prénom, email..."
        />

        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          keyField="id"
          emptyState="Aucun utilisateur trouvé."
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer définitivement l'utilisateur"
        message="Êtes-vous certain ? Cette suppression effacera définitivement toutes les données, tous les QR codes générés par cet utilisateur et toutes ses factures."
        confirmText="Confirmer suppression"
        loading={deleting}
      />
    </DashboardLayout>
  );
}
