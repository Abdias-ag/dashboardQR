'use strict';

'use client';

import React, { useEffect, useState } from 'react';
import { User, KeyRound, Mail, Phone, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/dashboard/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import userService from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';

export default function ProfilePage() {
  const { showToast } = useToast();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Profile forms
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Account deletion dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // 2FA state
  const [tfaEnabled, setTfaEnabled] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await userService.getProfile();
      if (res.success) {
        localStorage.setItem('user', JSON.stringify(res.data));
        setCurrentUser(res.data);
        setFirstname(res.data.firstname || '');
        setLastname(res.data.lastname || '');
        setPhone(res.data.phone || '');
      }
    } catch {
      showToast('error', 'Erreur lors de la récupération du profil.');
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setCurrentUser(u);
      setFirstname(u.firstname || '');
      setLastname(u.lastname || '');
      setPhone(u.phone || '');
    } else {
      fetchProfile();
    }
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const formData = new FormData();
      formData.append('firstname', firstname);
      formData.append('lastname', lastname);
      if (phone) formData.append('phone', phone);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await userService.updateProfile(formData);
      if (res.success) {
        localStorage.setItem('user', JSON.stringify(res.data));
        setCurrentUser(res.data);
        setAvatarFile(null);
        showToast('success', 'Profil mis à jour avec succès.');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('error', 'Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await userService.changePassword(currentPassword, newPassword);
      if (res.success) {
        showToast('success', 'Mot de passe modifié avec succès.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Erreur lors de la modification.');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showToast('error', 'Mot de passe requis pour suppression.');
      return;
    }
    setLoadingDelete(true);
    try {
      const res = await userService.deleteAccount(deletePassword);
      if (res.success) {
        showToast('success', 'Compte supprimé avec succès.');
        localStorage.clear();
        window.location.href = '/login';
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Mot de passe incorrect.');
    } finally {
      setLoadingDelete(false);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <DashboardLayout breadcrumb={[{ label: 'Profil' }]}>
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader title="Mon Profil" description="Gérez vos informations personnelles, sécurité et mots de passe." />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile form */}
          <Card>
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-800/60">
              <User className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Informations Personnelles</h3>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-4 py-2">
                <Avatar src={currentUser?.avatar} firstname={firstname} lastname={lastname} size="lg" />
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Photo de profil</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                    className="text-xs text-slate-400 file:bg-slate-800 file:border-none file:text-slate-300 file:px-2.5 file:py-1 file:rounded file:mr-2 file:cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Prénom" value={firstname} onChange={(e) => setFirstname(e.target.value)} required />
                <Input label="Nom" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
              </div>

              <Input label="Adresse E-mail (Non modifiable)" type="email" value={currentUser?.email || ''} icon={Mail} disabled className="opacity-60 cursor-not-allowed" />

              <Input label="Téléphone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} icon={Phone} />

              <div className="pt-2">
                <Button type="submit" loading={loadingProfile} className="w-full">
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </Card>

          {/* Security details */}
          <div className="space-y-6">
            {/* Password */}
            <Card>
              <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-800/60">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sécurité du mot de passe</h3>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input label="Mot de passe actuel" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                <Input label="Nouveau mot de passe" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <Input label="Confirmer le nouveau mot de passe" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />

                <div className="pt-2">
                  <Button type="submit" variant="secondary" loading={loadingPassword} className="w-full">
                    Modifier le mot de passe
                  </Button>
                </div>
              </form>
            </Card>

            {/* 2FA visual */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  Double Authentification (2FA)
                </h3>
                <Badge variant={tfaEnabled ? 'success' : 'slate'}>{tfaEnabled ? 'Actif' : 'Inactif'}</Badge>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Renforcez la sécurité de votre compte en demandant un code à usage unique lors de vos connexions.
              </p>
              <Button variant="outline" size="sm" onClick={() => { setTfaEnabled(!tfaEnabled); showToast('success', `Double authentification ${!tfaEnabled ? 'activée' : 'désactivée'} (simulation).`); }}>
                {tfaEnabled ? 'Désactiver le 2FA' : 'Activer le 2FA'}
              </Button>
            </Card>

            {/* Danger Zone account delete */}
            <Card className="border-red-500/10 bg-red-950/5 space-y-4" id="delete">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" /> Supprimer mon compte
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                La suppression de votre compte est définitive. Toutes vos données, QR codes dynamiques générés et statistiques de redirections seront effacés à tout jamais.
              </p>
              <Button variant="danger" size="sm" onClick={() => setDeleteConfirmOpen(true)}>
                Demander la suppression du compte
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Supprimer mon compte définitivement"
        message="Êtes-vous certain ? Cette opération efface définitivement toutes vos données. Veuillez entrer votre mot de passe pour confirmer :"
        confirmText="Supprimer mon compte"
        loading={loadingDelete}
      >
        <div className="mt-4">
          <Input
            label="Entrez votre mot de passe"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
      </ConfirmDialog>
    </DashboardLayout>
  );
}
