'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, QrCode, AlertCircle, Eye, EyeOff, Loader2, ArrowRight, Smartphone, X, ExternalLink } from 'lucide-react';
import api from '../lib/api';
import ThemeToggle from '../../components/dashboard/ThemeToggle';

const setAuthCookies = (accessToken, role) => {
  if (typeof document !== 'undefined') {
    document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;
    document.cookie = `userRole=${role}; path=/; max-age=604800; SameSite=Lax`;
  }
};

const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL || 'https://play.google.com/store/search?q=QR%20Platform&c=apps';
const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL || 'https://apps.apple.com/fr/search?term=QR%20Platform';

const goToDashboard = () => {
  window.location.replace('/dashboard');
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [showAppModal, setShowAppModal] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const passwordVal = watch("password");

  useEffect(() => {
    // Rediriger si déjà connecté
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (token) {
      const role = JSON.parse(storedUser || '{}')?.role || 'user';
      setAuthCookies(token, role);
      goToDashboard();
    }
    
    // Toggle register view based on URL search param
    const params = new URLSearchParams(window.location.search);
    if (params.get('register') === 'true') {
      setIsRegister(true);
    }
  }, [router]);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Inscription
        const res = await api.post('/auth/register', {
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          password: data.password,
          phone: data.phone || undefined,
        });

        if (res.data.success) {
          setVerificationEmail(data.email);
          setShowVerificationModal(true);
        }
      } else {
        // Connexion
        const res = await api.post('/auth/login', {
          email: data.email,
          password: data.password,
        });

        if (res.data.success) {
          const { accessToken, refreshToken, user } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          setAuthCookies(accessToken, user?.role || 'user');

          if (!user.isVerified) {
            setVerificationEmail(user.email);
            setShowVerificationModal(true);
          } else {
            goToDashboard();
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

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
        setShowAppModal(true);
      }
    } catch (err) {
      setVerificationError(err.response?.data?.message || 'Code incorrect ou expiré.');
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-600/5 dark:bg-orange-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md space-y-8 z-10"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 ring-1 ring-white/10">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
            QR Platform
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {isRegister
              ? 'Créez votre compte gratuit et commencez maintenant.'
              : 'La solution ultime pour vos QR codes dynamiques.'}
          </p>
        </div>

        <div className="glass rounded-3xl p-8 border border-slate-200 dark:border-zinc-800 shadow-2xl relative">
          <AnimatePresence mode="wait">
            <motion.form
              key={isRegister ? 'register' : 'login'}
              initial={{ opacity: 0, x: isRegister ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRegister ? -10 : 10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isRegister && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Prénom
                    </label>
                    <input
                      type="text"
                      {...register('firstname', { required: 'Prénom requis' })}
                      className="w-full bg-white dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Jean"
                    />
                    {errors.firstname && (
                      <p className="mt-1 text-xs text-red-500">{errors.firstname.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Nom
                    </label>
                    <input
                      type="text"
                      {...register('lastname', { required: 'Nom requis' })}
                      className="w-full bg-white dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Dupont"
                    />
                    {errors.lastname && (
                      <p className="mt-1 text-xs text-red-400">{errors.lastname.message}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email requis',
                      pattern: { value: /^\S+@\S+$/i, message: 'Format email invalide' }
                    })}
                    className="w-full bg-white dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Téléphone (Optionnel)
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full bg-white dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Mot de passe
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => router.push('/forgot-password')}
                      className="text-xs text-orange-600 dark:text-orange-400 hover:underline transition-colors"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Mot de passe requis',
                      minLength: isRegister ? { value: 8, message: '8 caractères minimum' } : undefined
                    })}
                    className="w-full bg-white dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl pl-11 pr-12 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    {...register('confirmPassword', {
                      required: 'Veuillez confirmer le mot de passe',
                      validate: (val) => val === passwordVal || 'Les mots de passe ne correspondent pas'
                    })}
                    className="w-full bg-white dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 mt-4 hover:shadow-orange-600/35 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isRegister ? 'Créer mon compte' : 'Se connecter'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              {isRegister ? (
                <span>Déjà un compte ? <strong className="text-orange-600 dark:text-orange-400 hover:underline">Connectez-vous</strong></span>
              ) : (
                <span>Nouveau ici ? <strong className="text-orange-600 dark:text-orange-400 hover:underline">Créez un compte gratuit</strong></span>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative bg-white dark:bg-zinc-900"
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
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-center text-2xl font-extrabold tracking-[10px] text-slate-800 dark:text-white focus:outline-none focus:border-orange-500 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                    placeholder="123456"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={verificationLoading || verificationCode.length !== 6}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800/50 disabled:text-slate-500 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
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

      {/* App download prompt shown after account verification */}
      <AnimatePresence>
        {showAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative bg-white dark:bg-zinc-900"
            >
              <button
                type="button"
                onClick={() => { setShowAppModal(false); router.push('/dashboard'); }}
                className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Votre compte est prêt</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Gérez vos QR Codes depuis le dashboard ou retrouvez QR Platform sur votre téléphone.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-3 py-3 text-xs font-semibold hover:bg-slate-800">
                  Google Play <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a href={APP_STORE_URL} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-3 py-3 text-xs font-semibold hover:bg-slate-800">
                  App Store <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <button
                type="button"
                onClick={() => { setShowAppModal(false); router.push('/dashboard'); }}
                className="w-full mt-3 rounded-xl border border-slate-200 dark:border-zinc-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800"
              >
                Continuer sur le site
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
