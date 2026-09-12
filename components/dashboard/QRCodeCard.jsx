'use strict';

import React from 'react';
import { Download, BarChart3, ToggleLeft, ToggleRight, Trash2, Copy, ExternalLink } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { motion } from 'framer-motion';

export default function QRCodeCard({ qr, isSelected, onSelect, onToggle, onDelete, onDownload, onViewStats, onDuplicate }) {
  const typeColorMap = {
    url: 'info',
    text: 'purple',
    phone: 'success',
    email: 'yellow',
    whatsapp: 'success',
    wifi: 'slate',
    vcard: 'purple',
    location: 'info',
    pdf: 'danger',
    image: 'yellow',
    video: 'red',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onSelect && onSelect(qr)}
      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden group ${
        isSelected
          ? 'border-orange-500 bg-orange-500/5 shadow-lg shadow-orange-500/10'
          : 'border-slate-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 hover:border-orange-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-900/70'
      }`}
    >
      {/* Glow on selected */}
      {isSelected && (
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <Badge variant={typeColorMap[qr.type] || 'slate'}>{qr.type}</Badge>
        <span className="text-xs text-slate-600 dark:text-slate-400 font-bold shrink-0">
          {(qr.scanCount || 0).toLocaleString()} scans
        </span>
      </div>

      {/* Name */}
      <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate mb-1">{qr.name}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate font-mono mb-4">
        /{qr.slug}
      </p>

      {/* Bottom bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800/60" onClick={(e) => e.stopPropagation()}>
        {/* Active toggle */}
        <button
          onClick={() => onToggle && onToggle(qr.id)}
          className="flex items-center gap-1.5 text-xs transition-colors cursor-pointer group/toggle"
          title={qr.isActive ? 'Désactiver' : 'Activer'}
        >
          {qr.isActive ? (
            <>
              <ToggleRight className="w-5 h-5 text-green-500 group-hover/toggle:text-green-400" />
              <span className="text-green-500 font-semibold group-hover/toggle:text-green-400">Actif</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              <span className="text-slate-400 dark:text-slate-500 font-semibold">Inactif</span>
            </>
          )}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onViewStats && (
            <button
              onClick={() => onViewStats(qr)}
              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-all cursor-pointer"
              title="Statistiques"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDownload && (
            <button
              onClick={() => onDownload(qr)}
              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              title="Télécharger"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(qr)}
              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              title="Dupliquer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(qr.id)}
              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
