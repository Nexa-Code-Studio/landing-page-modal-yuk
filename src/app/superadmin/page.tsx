"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Leaf, 
  Wind, 
  Recycle, 
  Users, 
  Store, 
  Building2, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

export default function SuperadminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any>("/analytics/superadmin/stats");
      setStats(data);
    } catch (err) {
      console.error("Gagal memuat data statistik superadmin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    if (!val) return "Rp 0";
    if (val >= 1000000000) {
      return `Rp ${(val / 1000000000).toFixed(1).replace(".0", "")} Milyar`;
    }
    if (val >= 1000000) {
      return `Rp ${(val / 1000000).toFixed(1).replace(".0", "")} Juta`;
    }
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const formatWeight = (kg: number) => {
    if (kg === undefined || kg === null) return "-";
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1).replace(".0", "")} Ton`;
    }
    return `${kg.toLocaleString("id-ID")} Kg`;
  };

  const formatCo2 = (kg: number) => {
    if (kg === undefined || kg === null) return "-";
    return `${kg.toLocaleString("id-ID")} Kg`;
  };

  const renderDiffWeight = (diff: number | null) => {
    if (diff === null || diff === undefined) return "-";
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${formatWeight(diff)} dari bulan lalu`;
  };

  const renderDiffCo2 = (diff: number | null) => {
    if (diff === null || diff === undefined) return "-";
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${formatCo2(diff)} dari bulan lalu`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-9 h-9 animate-spin text-[#0F3D2E]" />
        <span className="font-semibold text-sm animate-pulse">Memuat dashboard superadmin...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Utama Superadmin</h1>
          <p className="text-slate-500 mt-1">Pantau seluruh aktivitas pengguna, metrik keberlanjutan global, dan antrean sistem secara realtime.</p>
        </div>
      </div>

      {/* 1. Global Sustainability Metrics */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-600" />
          Dampak Keberlanjutan Global
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Recycle className="w-4 h-4 text-emerald-500" />
                Total Surplus Diselamatkan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">
                {formatWeight(stats?.total_saved_kg)}
              </div>
              <p className={`text-xs mt-1 font-semibold flex items-center gap-1 ${
                stats?.total_saved_kg_diff === null ? 'text-slate-400' : 'text-emerald-600'
              }`}>
                {stats?.total_saved_kg_diff !== null && <TrendingUp className="w-3 h-3" />}
                {renderDiffWeight(stats?.total_saved_kg_diff)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-500" />
                Total Reduksi Emisi CO₂
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">
                {formatCo2(stats?.total_co2_saved_kg)}
              </div>
              <p className={`text-xs mt-1 font-semibold flex items-center gap-1 ${
                stats?.total_co2_saved_kg_diff === null ? 'text-slate-400' : 'text-blue-600'
              }`}>
                {stats?.total_co2_saved_kg_diff !== null && <TrendingUp className="w-3 h-3" />}
                {renderDiffCo2(stats?.total_co2_saved_kg_diff)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F3D2E]" />
                Total Transaksi Surplus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">
                {(stats?.total_transactions || 0).toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-slate-500 mt-1">Transaksi sukses lintas platform</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2. Platform Growth Metrics & Verification Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Growth Metrics */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0F3D2E]" />
            Pertumbuhan Platform
          </h2>
          <Card className="border-slate-200/60 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Total Pengguna (Customers)</p>
                      <p className="text-xs text-slate-500">Akun terdaftar aktif</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">
                      {(stats?.total_customers || 0).toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-emerald-600 font-bold">
                      +{stats?.total_customers_diff || 0} bulan ini
                    </p>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Store className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Total Mitra (Merchant & Enterprise)</p>
                      <p className="text-xs text-slate-500">Cabang dan UMKM terdaftar</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">
                      {(stats?.total_partners || 0).toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-emerald-600 font-bold">
                      +{stats?.total_partners_diff || 0} bulan ini
                    </p>
                  </div>
                </div>
                
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Global GMV</p>
                      <p className="text-xs text-slate-500">Perputaran transaksi keseluruhan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">
                      {formatCurrency(stats?.global_gmv)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Queue (To-Do List) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            Antrean Verifikasi (To-Do)
          </h2>
          <Card className="border-slate-200/60 shadow-sm border-l-4 border-l-rose-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900">Perlu Tindakan Segera</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mt-2">
                <Link href="/superadmin/verifications/merchant" className="block">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-slate-400 group-hover:text-[#0F3D2E] transition-colors" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">Verifikasi Merchant Tunggal</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {stats?.pending_merchant_verifications || 0} pengajuan menunggu
                        </p>
                      </div>
                    </div>
                    {stats?.pending_merchant_verifications > 0 ? (
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                        {stats.pending_merchant_verifications}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs">
                        0
                      </div>
                    )}
                  </div>
                </Link>

                <Link href="/superadmin/verifications/enterprise" className="block">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-slate-400 group-hover:text-[#0F3D2E] transition-colors" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">Verifikasi Enterprise</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {stats?.pending_enterprise_verifications || 0} pengajuan menunggu
                        </p>
                      </div>
                    </div>
                    {stats?.pending_enterprise_verifications > 0 ? (
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                        {stats.pending_enterprise_verifications}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs">
                        0
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
