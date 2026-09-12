'use strict';

import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmer l\'action',
  message = 'Êtes-vous sûr de vouloir effectuer cette action ? Cette opération est potentiellement irréversible.',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  loading = false,
  variant = 'danger',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" showClose={!loading}>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${variant === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
