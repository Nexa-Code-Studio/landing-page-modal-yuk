"use client";

import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
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
  Loader2,
  Calendar,
  MapPin,
  ChevronDown,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { marked } from "marked";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const renderAIContent = (content: string) => {
  if (!content) return "";
  try {
    const parsed = marked.parse(content);
    if (typeof parsed === "string") {
      return parsed;
    }
    return content;
  } catch (e) {
    console.error("Error parsing markdown:", e);
    return content;
  }
};

export default function SuperadminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<string>("all");
  const [city, setCity] = useState<string>("all");
  const [cities, setCities] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(true);
  const [aiRecommendation, setAiRecommendation] = useState("");

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<any>(`/analytics/superadmin/stats?timeframe=${timeframe}&city=${city}`);
      setStats(data);
    } catch (err) {
      console.error("Gagal memuat data statistik superadmin:", err);
    }
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await apiClient.get<string[]>("/analytics/superadmin/cities");
        setCities(data);
      } catch (err) {
        console.error("Gagal memuat data kota mitra:", err);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchAiRecommendation = async () => {
      setLoadingAi(true);
      try {
        const res = await apiClient.get<any>("/analytics/superadmin/ai-insights");
        if (res && res.recommendation) {
          setAiRecommendation(res.recommendation);
        }
      } catch (err) {
        console.error("Gagal memuat rekomendasi AI superadmin:", err);
      } finally {
        setLoadingAi(false);
      }
    };
    fetchAiRecommendation();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };
    loadData();
  }, [timeframe, city]);


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

  const getDiffLabel = () => {
    if (timeframe === "today") return "dari kemarin";
    if (timeframe === "7d") return "dari 7 hari lalu";
    if (timeframe === "30d") return "dari 30 hari lalu";
    return "dari bulan lalu";
  };

  const getGrowthLabel = () => {
    if (timeframe === "today") return "hari ini";
    if (timeframe === "7d") return "7 hari terakhir";
    if (timeframe === "30d") return "30 hari terakhir";
    return "bulan ini";
  };

  const renderDiffWeight = (diff: number | null) => {
    if (diff === null || diff === undefined) return "-";
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${formatWeight(diff)} ${getDiffLabel()}`;
  };

  const renderDiffCo2 = (diff: number | null) => {
    if (diff === null || diff === undefined) return "-";
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${formatCo2(diff)} ${getDiffLabel()}`;
  };

  const trendLabels = stats?.trends?.map((t: any) => t.month) || ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];
  
  const savedTrendData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Surplus Diselamatkan (Kg)",
        data: stats?.trends?.map((t: any) => t.saved_kg) || [0, 0, 0, 0, 0, 0],
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const co2TrendData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Reduksi CO₂ (Kg)",
        data: stats?.trends?.map((t: any) => t.co2_saved_kg) || [0, 0, 0, 0, 0, 0],
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const txTrendData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Jumlah Transaksi",
        data: stats?.trends?.map((t: any) => t.transactions) || [0, 0, 0, 0, 0, 0],
        borderColor: "rgba(15, 61, 46, 1)",
        backgroundColor: "rgba(15, 61, 46, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const gmvTrendData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Global GMV (Rp)",
        data: stats?.trends?.map((t: any) => t.gmv) || [0, 0, 0, 0, 0, 0],
        borderColor: "rgba(245, 158, 11, 1)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
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
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Utama Superadmin</h1>
          <p className="text-slate-500 mt-1">Pantau seluruh aktivitas pengguna, metrik keberlanjutan global, dan antrean sistem secara realtime.</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 md:self-auto">
          {/* Rentang Waktu */}
          <div className="relative min-w-[160px]">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl appearance-none bg-white focus:outline-none focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E] cursor-pointer text-slate-600 font-medium"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
              <option value="this_month">Bulan Ini</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Wilayah/Kota */}
          <div className="relative min-w-[160px]">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl appearance-none bg-white focus:outline-none focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E] cursor-pointer text-slate-600 font-medium"
            >
              <option value="all">Semua Kota</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
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

      {/* Tren Kunci Platform (Grid 2x2 Line Charts) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#0F3D2E]" />
          Tren Kunci Platform (6 Bulan Terakhir)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200/60 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-500">Total Surplus Diselamatkan (Kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <Line data={savedTrendData} options={chartOptions} />
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-500">Total Reduksi Emisi CO₂ (Kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <Line data={co2TrendData} options={chartOptions} />
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-500">Total Transaksi Surplus</CardTitle>
            </CardHeader>
            <CardContent>
              <Line data={txTrendData} options={chartOptions} />
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-500">Global GMV (Rupiah)</CardTitle>
            </CardHeader>
            <CardContent>
              <Line data={gmvTrendData} options={chartOptions} />
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
                      +{stats?.total_customers_diff || 0} {getGrowthLabel()}
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
                      +{stats?.total_partners_diff || 0} {getGrowthLabel()}
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

      {/* AI Recommendations Container */}
      <Card className="border-slate-200/60 shadow-md relative overflow-hidden bg-gradient-to-br from-emerald-50/20 via-white to-white border-l-4 border-l-[#0F3D2E] mt-4">
        <CardHeader className="pb-3 flex flex-row items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-700 animate-pulse" />
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
              Analisis & Rekomendasi AI Resurva Superadmin
            </CardTitle>
            <p className="text-xs text-slate-400 font-medium normal-case mt-0.5">
              Rekomendasi strategis berbasis data platform untuk optimalisasi sistem dan perluasan jaringan mitra.
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {loadingAi ? (
            <div className="space-y-2 animate-pulse py-2">
              <div className="h-4 bg-emerald-100/50 rounded-full w-5/6"></div>
              <div className="h-4 bg-emerald-100/50 rounded-full w-4/6"></div>
            </div>
          ) : (
            <div 
              className="text-slate-600 text-sm leading-relaxed markdown-content"
              dangerouslySetInnerHTML={{ 
                __html: renderAIContent(aiRecommendation || "") 
              }}
            />
          )}
        </CardContent>
      </Card>

      <style>{`
        .markdown-content strong {
          font-weight: 700;
        }
        .markdown-content p {
          margin-bottom: 0.5rem;
        }
        .markdown-content p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}

