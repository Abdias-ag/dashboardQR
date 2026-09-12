'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Plus, Download, ExternalLink } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/dashboard/PageHeader';
import SearchBar from '../../components/dashboard/SearchBar';
import QRCodeCard from '../../components/dashboard/QRCodeCard';
import Pagination from '../../components/dashboard/Pagination';
import EmptyState from '../../components/dashboard/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import qrService from '../../services/qrService';
import { useToast } from '../../contexts/ToastContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';

const getAssetUrl = (assetPath) => {
  if (!assetPath) return '';
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  return `${API_URL}${assetPath.startsWith('/') ? '' : '/'}${assetPath}`;
};

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date de création' },
  { value: 'name', label: 'Nom' },
  { value: 'scanCount', label: 'Nombre de scans' },
];

export default function MyQRCodesPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [qrs, setQrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedQr, setSelectedQr] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQrs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await qrService.getQrCodes({ search, sortBy, sortDir, page, limit: 9 });
      if (res.success) {
        setQrs(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err) {
      showToast('error', 'Impossible de charger les QR Codes.');
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortDir, page]);

  useEffect(() => { fetchQrs(); }, [fetchQrs]);

  const handleToggle = async (id) => {
    try {
      const res = await qrService.toggleActive(id);
      if (res.success) {
        setQrs(prev => prev.map(q => q.id === id ? { ...q, isActive: res.data.isActive } : q));
        showToast('success', `QR Code ${res.data.isActive ? 'activé' : 'désactivé'} avec succès.`);
      }
    } catch { showToast('error', 'Erreur lors du changement de statut.'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await qrService.deleteQrCode(deleteId);
      if (res.success) {
        setQrs(prev => prev.filter(q => q.id !== deleteId));
        if (selectedQr?.id === deleteId) setSelectedQr(null);
        showToast('success', 'QR Code supprimé avec succès.');
      }
    } catch { showToast('error', 'Erreur lors de la suppression.'); }
    finally { setDeleting(false); setDeleteId(null); }
  };

  const handleDownload = async (qr) => {
    try {
      const res = await fetch(getAssetUrl(qr.qrImage));
      if (!res.ok) throw new Error('Image QR indisponible');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${qr.name.replace(/\s+/g, '_')}_qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showToast('success', 'Téléchargement réussi.');
    } catch {
      // Fallback
      window.open(getAssetUrl(qr.qrImage), '_blank');
      showToast('info', 'Ouverture de l\'image dans un nouvel onglet.');
    }
  };

  const handleDuplicate = async (qr) => {
    showToast('info', 'Fonctionnalité disponible prochainement.');
  };

  // Regrouper par dossier si présent, sinon 'No folder'
  const folders = React.useMemo(() => {
    const map = new Map();
    qrs.forEach((q) => {
      const key = q.folder?.name || 'No folder';
      const entry = map.get(key) || { name: key, count: 0 };
      entry.count += 1;
      map.set(key, entry);
    });
    return Array.from(map.values());
  }, [qrs]);

  return (
    <DashboardLayout breadcrumb={[{ label: 'Mes QR Codes' }]}>
      <div className="w-full space-y-4 sm:space-y-6">
        <PageHeader
          title="Mes QR Codes"
          description="Gérez, analysez et partagez vos codes QR dynamiques."
          actions={
            <Button size="sm" icon={Plus} onClick={() => router.push('/create-qr')}>
              <span className="hidden sm:inline">Créer un QR Code</span>
              <span className="sm:hidden">+ QR</span>
            </Button>
          }
        />

        <SearchBar
          search={search}
          setSearch={(v) => { setSearch(v); setPage(1); }}
          placeholder="Rechercher par nom, type, slug..."
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDir={sortDir}
          setSortDir={setSortDir}
          sortOptions={SORT_OPTIONS}
        />

        {/* Folder cards */}
        <div className="flex gap-4 overflow-x-auto py-3 hide-scrollbar">
          {folders.length === 0 ? (
            <div className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-slate-500 dark:text-slate-400">Aucun dossier</div>
          ) : (
            folders.map((f, idx) => (
              <Card key={f.name} className="min-w-[180px] p-4 flex items-start justify-between gap-3 bg-white dark:bg-zinc-900">
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{f.count} Files</p>
                  <h4 className="mt-2 font-semibold text-slate-800 dark:text-white truncate max-w-[200px]">{f.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Mar {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-slate-400 dark:text-slate-500 font-bold">{idx + 1}</div>
              </Card>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          {/* QR Codes Grid */}
          <div className="xl:col-span-3 space-y-4">
            {loading ? (
              <Loader size="md" />
            ) : qrs.length === 0 ? (
              <Card>
                <EmptyState
                  icon={QrCode}
                  title="Aucun QR Code trouvé"
                  description="Créez votre premier QR Code dynamique dès maintenant et commencez à tracker vos scans."
                  action={() => router.push('/create-qr')}
                  actionLabel="Créer mon premier QR Code"
                  actionIcon={Plus}
                />
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {qrs.map((qr) => (
                    <QRCodeCard
                      key={qr.id}
                      qr={qr}
                      isSelected={selectedQr?.id === qr.id}
                      onSelect={setSelectedQr}
                      onToggle={handleToggle}
                      onDownload={handleDownload}
                      onViewStats={(qr) => router.push(`/analytics?qr=${qr.id}`)}
                      onDelete={(id) => setDeleteId(id)}
                      onDuplicate={handleDuplicate}
                    />
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>

          {/* Detail Panel */}
          <div className="xl:col-span-1">
            <Card className="sticky top-24 space-y-5">
              {selectedQr ? (
                <>
                  <div className="text-center space-y-1">
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">{selectedQr.name}</h3>
                    <Badge variant="info">{selectedQr.type}</Badge>
                  </div>

                  {selectedQr.qrImage && (
                    <div className="bg-white p-4 rounded-2xl max-w-[180px] mx-auto shadow-xl border border-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getAssetUrl(selectedQr.qrImage)} alt="QR Code" className="w-full h-auto" />
                    </div>
                  )}

                  <div className="space-y-3 text-xs pt-3 border-t border-slate-100 dark:border-zinc-800/60">
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">URL dynamique</p>
                      <a href={selectedQr.dynamicUrl} target="_blank" rel="noreferrer" className="text-orange-500 hover:text-orange-600 hover:underline block truncate">
                        {selectedQr.dynamicUrl}
                      </a>
                    </div>
                    {selectedQr.content && (
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Contenu cible</p>
                        <p className="text-slate-600 dark:text-slate-400 truncate">{selectedQr.content}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <span className="text-center font-bold text-slate-800 dark:text-white text-lg">{selectedQr.scanCount || 0}</span>
                      <span className="text-center text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider self-center">Scans</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/60">
                    <Button variant="primary" size="sm" icon={Download} className="w-full" onClick={() => handleDownload(selectedQr)}>
                      Télécharger
                    </Button>
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => router.push(`/analytics?qr=${selectedQr.id}`)}>
                      Voir Analytics
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-16 text-center">
                  <QrCode className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-xs leading-relaxed">Sélectionnez un QR Code<br />pour afficher ses détails</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer le QR Code"
        message="Cette action est irréversible. Toutes les statistiques de scan associées seront également supprimées."
        confirmText="Supprimer définitivement"
        loading={deleting}
      />
    </DashboardLayout>
  );
}
