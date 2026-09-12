'use strict';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';

const LANGUAGES = [
  { value: 'fr', label: 'FR', flag: '🇫🇷' },
  { value: 'en', label: 'EN', flag: '🇬🇧' },
  { value: 'es', label: 'ES', flag: '🇪🇸' },
];

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('fr');
  const ref = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelect = (code) => {
    setLang(code);
    setOpen(false);
    showToast('success', `Langue modifiée : ${code.toUpperCase()} (simulation)`);
  };

  const currentLang = LANGUAGES.find(l => l.value === lang) || LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800/60 text-slate-600 dark:text-slate-300 transition-all cursor-pointer text-xs font-semibold"
      >
        <Globe className="w-4 h-4 text-slate-500" />
        <span>{currentLang.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 w-32 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden p-1.5 space-y-0.5"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.value}
                onClick={() => handleSelect(l.value)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  lang === l.value ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
