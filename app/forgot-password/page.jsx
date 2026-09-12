'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = request email, 2 = verify & change pass

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleRequestReset = async (data) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: data.email });
      if (res.data.success) {
        setResetEmail(data.email);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur d\'envoi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: resetEmail,
        code,
        password: newPassword,
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6 z-10"
      >
        <button
          onClick={() => router.push('/login')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </button>

        <div className="glass rounded-3xl p-8 border border-white/5 shadow-2xl relative">
          <h2 className="text-2xl font-bold text-white mb-2">Mot de passe oublié</h2>

          {success ? (
            <div className="space-y-4 text-center py-6">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-green-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-300">
                Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
              </p>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleSubmit(handleRequestReset)} className="space-y-4 mt-6">
              <p className="text-xs text-slate-400 leading-relaxed">
                Entrez votre adresse email ci-dessous. Si elle existe, nous vous enverrons un code de réinitialisation de mot de passe.
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    {...register('email', { required: 'Email requis' })}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Envoyer le code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 mt-6">
              <p className="text-xs text-slate-400">
                Saisissez le code reçu par email ainsi que votre nouveau mot de passe.
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Code de réinitialisation
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Ex: 123456"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Changer le mot de passe'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
