'use strict';

import React from 'react';
import { ChevronRight, Download, MoreHorizontal } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';

const getAssetUrl = (assetPath) => {
  if (!assetPath) return '';
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  return `${API_URL}${assetPath.startsWith('/') ? '' : '/'}${assetPath}`;
};

export default function QRCodeListItem({ qr, onSelect, onDownload, onViewStats, onDelete }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-slate-900/50 hover:shadow-md hover:border-slate-700 transition">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-20 h-20 bg-white rounded-md flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getAssetUrl(qr.qrImage)} alt="qr" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="info">{qr.type}</Badge>
            <h4 className="text-sm font-semibold text-white truncate">{qr.name}</h4>
          </div>
          <p className="text-slate-500 text-xs font-mono truncate mt-1">/{qr.slug}</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="text-center">
          <div className="text-xs text-slate-400">Scans</div>
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold mt-1">{(qr.scanCount||0).toLocaleString()}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onViewStats && onViewStats(qr)}>Détails</Button>
          <button onClick={() => onDownload && onDownload(qr)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"><Download className="w-4 h-4"/></button>
          <button onClick={() => onDelete && onDelete(qr.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"><MoreHorizontal className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  );
}
