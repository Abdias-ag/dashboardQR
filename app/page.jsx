'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, BarChart3, ArrowRight, Shield, Globe,
  Menu, X, Mail, MessageSquare, Info, Users, Sparkles, Check,
  KeyRound, AlertCircle, Eye, EyeOff, Loader2, Phone
} from 'lucide-react';
import ThemeToggle from '../components/dashboard/ThemeToggle';
import api from './lib/api';

const setAuthCookies = (accessToken, role) => {
  if (typeof document !== 'undefined') {
    document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;
    document.cookie = `userRole=${role}; path=/; max-age=604800; SameSite=Lax`;
  }
};

export default function RootPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  // ── Auth Modal States ──
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form input states
  const [authForm, setAuthForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Verification code states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // Check if already logged in on load
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  // Open Auth Modal
  const openAuth = (type) => {
    setAuthType(type);
    setAuthError('');
    setAuthModalOpen(true);
  };

  // Submit Login/Registration
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    // Check pass match
    if (authType === 'register' && authForm.password !== authForm.confirmPassword) {
      setAuthError('Les mots de passe ne correspondent pas.');
      return;
    }

    setAuthLoading(true);

    try {
      if (authType === 'register') {
        const res = await api.post('/auth/register', {
          firstname: authForm.firstname,
          lastname: authForm.lastname,
          email: authForm.email,
          password: authForm.password,
          phone: authForm.phone || undefined,
        });

        if (res.data.success) {
          setVerificationEmail(authForm.email);
          setAuthModalOpen(false);
          setShowVerificationModal(true);
        }
      } else {
        const res = await api.post('/auth/login', {
          email: authForm.email,
          password: authForm.password,
        });

        if (res.data.success) {
          const { accessToken, refreshToken, user } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          setAuthCookies(accessToken, user?.role || 'user');

          if (!user.isVerified) {
            setVerificationEmail(user.email);
            setAuthModalOpen(false);
            setShowVerificationModal(true);
          } else {
            router.push('/dashboard');
          }
        }
      }
    } catch (err) {
      console.error(err);
      const validationErrors = Object.values(err.response?.data?.errors || {}).flat();
      setAuthError(validationErrors.join(' ') || err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Submit Verification Code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setVerificationError('');
    setVerificationLoading(true);

    try {
      const res = await api.post('/auth/verify-email', {
        email: verificationEmail,
        code: verificationCode,
      });

      if (res.data.success) {
        const { accessToken, refreshToken, user } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthCookies(accessToken, user?.role || 'user');
        setShowVerificationModal(false);
        router.push('/dashboard');
      }
    } catch (err) {
      setVerificationError(err.response?.data?.message || 'Code incorrect ou expiré.');
    } finally {
      setVerificationLoading(false);
    }
  };

  const menuItems = [
    { label: 'À propos', href: '#apropos' },
    { label: 'Qui sommes-nous', href: '#qui-sommes-nous' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <div className="min-h-screen bg-background text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-100 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/30">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
              QR <span className="text-orange-500">Platform</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => openAuth('login')}
              className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 px-3 py-2 transition-all cursor-pointer"
            >
              Connexion
            </button>
            <button
              onClick={() => openAuth('register')}
              className="bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-600/20 hover:shadow-orange-500/30 transition-all cursor-pointer"
            >
              Inscription
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-6 space-y-4"
          >
            <div className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500"
                >
                  {item.label}
                </a>
              ))}
              <div className="h-px bg-slate-100 dark:border-zinc-800 my-2" />
              <button
                onClick={() => { setMobileMenuOpen(false); openAuth('login'); }}
                className="w-full py-3 text-center text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-zinc-800 rounded-xl"
              >
                Connexion
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); openAuth('register'); }}
                className="w-full py-3 text-center bg-orange-600 text-white font-bold rounded-xl"
              >
                Inscription
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO SECTION ── */}
      <section className="relative py-20 lg:py-32 overflow-hidden flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Génération dynamique & intelligente
              </div>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Générez des QR codes <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                  Dynamiques & Traçables
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Modifiez instantanément l&apos;URL de destination de vos QR codes, suivez les statistiques de scan en temps réel et optimisez vos campagnes marketing en quelques clics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => openAuth('register')}
                  className="bg-orange-600 hover:bg-orange-500 text-white text-base font-bold px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Créer un compte gratuit
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#apropos"
                  className="flex items-center justify-center text-slate-600 dark:text-slate-355 hover:text-orange-500 dark:hover:text-orange-400 text-base font-bold px-6 py-4 transition-colors"
                >
                  En savoir plus
                </a>
              </div>
            </div>

            {/* Visual elements */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-orange-500/10 dark:bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative max-w-sm w-full space-y-4">
                <div className="bg-slate-50 dark:bg-zinc-950 p-6 rounded-2xl border border-slate-100 dark:border-zinc-900 flex items-center justify-center">
                  <div className="bg-white p-3 rounded-xl shadow-md w-48 h-48 flex items-center justify-center">
                    <QrCode className="w-40 h-40 text-slate-900" />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-3">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Dynamic Link</p>
                    <p className="text-sm font-semibold text-orange-500">qr-code.click/mycompany</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase">Scans</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">1,245</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section id="apropos" className="py-20 bg-white dark:bg-zinc-950/40 border-t border-slate-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <Info className="w-6 h-6 text-orange-500 mx-auto" />
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">À propos de nos fonctionnalités</h2>
            <p className="text-slate-600 dark:text-slate-400">Pourquoi opter pour nos codes QR dynamiques ?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: 'Lien Modifiable',
                desc: 'Changez de lien de redirection à tout moment sans changer l\'aspect ou réimprimer votre code QR.',
              },
              {
                icon: BarChart3,
                title: 'Statistiques en Direct',
                desc: 'Suivez le nombre total de scans, l\'appareil utilisé et la localisation des personnes scannant vos codes.',
              },
              {
                icon: Shield,
                title: 'Hautement Sécurisé',
                desc: 'Tous vos codes dynamiques passent par des redirections ultra-rapides sécurisées par chiffrement SSL.',
              },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="bg-background border border-slate-100 dark:border-zinc-800/80 p-8 rounded-3xl space-y-4 hover:shadow-xl hover:border-orange-200 dark:hover:border-zinc-700 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{feat.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHO WE ARE SECTION ── */}
      <section id="qui-sommes-nous" className="py-20 border-t border-slate-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual element */}
            <div className="lg:col-span-5 order-last lg:order-first flex justify-center">
              <div className="bg-orange-500/10 text-orange-500 p-12 rounded-full relative">
                <Users className="w-32 h-32" />
                <div className="absolute -bottom-4 -right-4 bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl p-4 shadow-lg text-slate-800 dark:text-white font-bold text-sm">
                  🚀 +10K utilisateurs
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-bold uppercase tracking-wider text-orange-500">Qui sommes-nous</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Notre Mission</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Nous sommes une équipe passionnée d&apos;ingénieurs et de marketeurs ayant pour mission de simplifier la connexion entre le monde physique et le monde digital.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Notre plateforme permet à des milliers d&apos;entreprises de générer, d&apos;imprimer et de tracker leurs codes QR dynamiques afin d&apos;optimiser au mieux la conversion clients et l&apos;accès à leurs contenus numériques.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-orange-500 shrink-0" />
                  <span className="text-sm font-semibold">Simplicité d&apos;utilisation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-orange-500 shrink-0" />
                  <span className="text-sm font-semibold">Support client réactif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section id="contact" className="py-20 bg-white dark:bg-zinc-950/40 border-t border-slate-100 dark:border-zinc-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <MessageSquare className="w-6 h-6 text-orange-500 mx-auto" />
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Contactez-nous</h2>
            <p className="text-slate-600 dark:text-slate-400">Une question ou besoin d&apos;aide ? Remplissez ce formulaire et nous vous répondrons dans les plus brefs délais.</p>
          </div>

          <div className="bg-background border border-slate-150 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-10 shadow-xl">
            {contactSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Message envoyé !</h3>
                <p className="text-sm text-slate-500">Merci, nous vous recontacterons très vite.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jean Dupont"
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Votre message..."
                    className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-600/20 hover:shadow-orange-500/35 transition-all cursor-pointer"
                >
                  Envoyer mon message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-900 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/30">
              <QrCode className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
              QR <span className="text-orange-500">Platform</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} QR Platform. Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* ── CONNEXION & INSCRIPTION MODAL ── */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setAuthModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/30 mb-3">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {authType === 'register' ? 'Créer un compte' : 'Se connecter'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {authType === 'register' ? 'Créez votre compte pour commencer' : 'Accédez à votre espace d\'administration'}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {authType === 'register' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        required
                        value={authForm.firstname}
                        onChange={(e) => setAuthForm({ ...authForm, firstname: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="Jean"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        required
                        value={authForm.lastname}
                        onChange={(e) => setAuthForm({ ...authForm, lastname: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {authType === 'register' && (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Téléphone (Optionnel)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={authForm.phone}
                        onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authType === 'register' && (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      required
                      value={authForm.confirmPassword}
                      onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-850 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-orange-600/10 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {authLoading ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <>
                      <span>{authType === 'register' ? 'Créer mon compte' : 'Se connecter'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-900 text-center">
                <button
                  onClick={() => {
                    setAuthType(authType === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  {authType === 'register' ? (
                    <span>Déjà un compte ? <strong className="text-orange-550 dark:text-orange-400 hover:underline">Connectez-vous</strong></span>
                  ) : (
                    <span>Nouveau ici ? <strong className="text-orange-550 dark:text-orange-400 hover:underline">Créez un compte gratuit</strong></span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── VERIFICATION CODE MODAL ── */}
      <AnimatePresence>
        {showVerificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Vérifiez votre Email</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Nous avons envoyé un code de vérification à 6 chiffres à <strong>{verificationEmail}</strong>.
              </p>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                {verificationError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-2.5 rounded-xl">
                    {verificationError}
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-center text-2xl font-extrabold tracking-[10px] text-slate-800 dark:text-white focus:outline-none focus:border-orange-500 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                    placeholder="123456"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={verificationLoading || verificationCode.length !== 6}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-850 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {verificationLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Confirmer le code'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
