"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Crown,
  Plus,
  QrCode,
  ScanLine,
  TrendingUp,
  Wifi,
  Contact,
  Globe
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import analyticsService from "../../services/analyticsService";

// Fallback demo data to showcase clean UI matching mockup when user has 0 stats
const DEMO_RECENT_ACTIVITY = [
  { id: "demo-1", name: "Mon site web", type: "URL", icon: Globe, iconColor: "blue", time: "14:32" },
  { id: "demo-2", name: "Réseau Wi-Fi", type: "Wi-Fi", icon: Wifi, iconColor: "green", time: "13:10" },
  { id: "demo-3", name: "Contact professionnel", type: "Contact", icon: Contact, iconColor: "green", time: "11:45" },
];

const DEMO_MY_QR_CODES = [
  { id: "demo-1", name: "Mon site web", type: "URL", icon: Globe, iconColor: "blue", scans: 128 },
  { id: "demo-2", name: "Bureau Wi-Fi", type: "Wi-Fi", icon: Wifi, iconColor: "green", scans: 45 },
  { id: "demo-3", name: "Contact", type: "Contact", icon: Contact, iconColor: "blue", scans: 12 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState({ firstname: "Admin", lastname: "System" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    if (!token) {
      router.replace("/login");
      return;
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        /* fallback */
      }
    }
    analyticsService
      .getDashboardStats()
      .then((response) => {
        if (response.success) setStats(response.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const overview = stats?.overview || {};
  const realQrCodes = stats?.topQrCodes || [];
  const activityRate = overview.totalQrCodes
    ? Math.round((overview.activeQrCodes / overview.totalQrCodes) * 100)
    : 0;

  const totalScans = overview.totalScans || 0;
  const totalQrCodes = overview.totalQrCodes || 0;

  // Decide whether to show real items or demo items
  const recentActivities = realQrCodes.length > 0
    ? realQrCodes.map((code) => ({
        id: code.id,
        name: code.name,
        type: code.type || "URL",
        icon: QrCode,
        iconColor: "blue",
        time: new Date(code.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }))
    : DEMO_RECENT_ACTIVITY;

  const myQrCodesList = realQrCodes.length > 0
    ? realQrCodes.map((code) => ({
        id: code.id,
        name: code.name,
        type: code.type || "URL",
        icon: QrCode,
        iconColor: "blue",
        scans: code.scanCount || 0,
      }))
    : DEMO_MY_QR_CODES;

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Bonjour, {user.firstname || 'Admin'} {user.lastname || 'System'} <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Voici un aperçu de votre activité sur la plateforme.
            </p>
          </div>
          <Button
            size="sm"
            icon={Plus}
            onClick={() => router.push("/create-qr")}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 px-4 py-2.5 shrink-0 self-start sm:self-auto"
          >
            Nouveau QR Code
          </Button>
        </div>

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: SCANS TOTAUX */}
          <div className="relative rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <ScanLine className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    SCANS TOTAUX
                  </p>
                  <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
                    {totalScans.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">Visiteurs redirigés</p>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </div>

          {/* Card 2: TAUX D'ACTIVITÉ */}
          <div className="relative rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    TAUX D&apos;ACTIVITÉ
                  </p>
                  <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
                    {activityRate}%
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">QR actifs / total</p>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </div>
          </div>

          {/* Card 3: MES QR CODES */}
          <div className="relative rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    MES QR CODES
                  </p>
                  <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
                    {totalQrCodes.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">Total créés</p>
              <QrCode className="h-4 w-4 text-emerald-500" />
            </div>
          </div>

          {/* Card 4: ABONNEMENT */}
          <div className="relative rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    ABONNEMENT
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">
                    SaaS PRO
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-500">Actif</span>
              <button
                onClick={() => router.push("/subscriptions")}
                className="text-slate-400 hover:text-blue-600 transition-colors"
                aria-label="Voir l'abonnement"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2 Main Section Cards Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Card: Activité récente */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Activité récente
                </h2>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {recentActivities.map((item) => {
                  const Icon = item.icon;
                  const isGreen = item.iconColor === "green";
                  return (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/analytics?qr=${item.id}`)}
                      className="flex items-center justify-between py-3 transition-colors cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 rounded-xl px-2 -mx-2"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isGreen
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            QR {item.type}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {item.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => router.push("/my-qrcodes")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                Voir tout <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          {/* Right Card: Mes QR codes */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Mes QR codes
                </h2>
                <button
                  onClick={() => router.push("/my-qrcodes")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors cursor-pointer"
                >
                  Voir tout →
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {myQrCodesList.map((item) => {
                  const Icon = item.icon;
                  const isGreen = item.iconColor === "green";
                  return (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/analytics?qr=${item.id}`)}
                      className="flex items-center justify-between py-3 transition-colors cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 rounded-xl px-2 -mx-2"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isGreen
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            QR {item.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <span>{item.scans} scans</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}