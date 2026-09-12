'use strict';

'use client';

import React, { useEffect, useState } from 'react';
import { Camera, RefreshCw, Clipboard, ExternalLink, History } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/dashboard/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../contexts/ToastContext';

export default function ScannerPage() {
  const { showToast } = useToast();
  const [result, setResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [history, setHistory] = useState([]);
  const [scannerInstance, setScannerInstance] = useState(null);

  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem('scanHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (text) => {
    const newEntry = { id: Date.now().toString(), text, date: new Date().toISOString() };
    const updated = [newEntry, ...history.slice(0, 19)];
    setHistory(updated);
    localStorage.setItem('scanHistory', JSON.stringify(updated));
  };

  const startScanner = async () => {
    setIsScanning(true);
    setResult('');
    
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      
      const scanner = new Html5QrcodeScanner('reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      }, false);

      scanner.render(
        (decodedText) => {
          setResult(decodedText);
          saveToHistory(decodedText);
          showToast('success', 'QR Code scanné avec succès !');
          scanner.clear().catch(console.error);
          setIsScanning(false);
        },
        (error) => {
          // Silent errors during frame scans
        }
      );

      setScannerInstance(scanner);
    } catch (err) {
      showToast('error', 'Impossible de démarrer la caméra.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerInstance) {
      try {
        await scannerInstance.clear();
      } catch (e) {
        console.error(e);
      }
      setScannerInstance(null);
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerInstance) {
        scannerInstance.clear().catch(console.error);
      }
    };
  }, [scannerInstance]);

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    showToast('success', 'Copié dans le presse-papiers.');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('scanHistory');
    showToast('info', 'Historique vidé.');
  };

  return (
    <DashboardLayout breadcrumb={[{ label: 'Scanner' }]}>
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Scanner un QR Code"
          description="Utilisez votre webcam ou caméra pour décoder instantanément n'importe quel code QR."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scanner Box */}
          <Card className="flex flex-col justify-between min-h-[400px]">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Lecteur de caméra</h3>
              
              <div className="relative bg-slate-950 aspect-video rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
                <div id="reader" className="w-full h-full" />
                {!isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 z-10">
                    <Camera className="w-10 h-10 text-slate-600" />
                    <p className="text-xs text-slate-500">Caméra inactive</p>
                    <Button onClick={startScanner} icon={Camera}>
                      Activer la caméra
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {isScanning && (
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <Button variant="secondary" size="sm" onClick={stopScanner}>
                  Arrêter la caméra
                </Button>
              </div>
            )}
          </Card>

          {/* Results & History Panel */}
          <div className="space-y-6">
            {/* Result Box */}
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Résultat du scan</h3>
              {result ? (
                <div className="space-y-3">
                  <div className="bg-slate-950 border border-indigo-500/20 p-4 rounded-xl text-slate-200 text-sm font-mono break-all leading-relaxed">
                    {result}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" icon={Clipboard} onClick={copyToClipboard} className="flex-1">
                      Copier
                    </Button>
                    {result.startsWith('http') && (
                      <a href={result} target="_blank" rel="noreferrer" className="flex-1">
                        <Button variant="primary" size="sm" icon={ExternalLink} className="w-full">
                          Ouvrir le lien
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">En attente d'un scan...</p>
              )}
            </Card>

            {/* History Box */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" /> Historique récent
                </h3>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase cursor-pointer">
                    Vider
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/40 pr-1">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4">Aucun QR code scanné récemment.</p>
                ) : (
                  history.map((h) => (
                    <div key={h.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-300 truncate font-mono">{h.text}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(h.date).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {h.text.startsWith('http') && (
                        <a href={h.text} target="_blank" rel="noreferrer" className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
