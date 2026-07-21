"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, TreePine, Car, Smartphone, Target, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { apiClient, getStoredUser } from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SustainabilityData {
  co2e_total: number;
  target_co2e: number;
  progress_percent: number;
  trees_equivalent: number;
  km_driven_equivalent: number;
  phone_hours_equivalent: number;
  monthly_trend: { label: string; co2e: number }[];
}

export default function SustainabilityPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartPeriod, setChartPeriod] = useState("6bulan");
  const [sustData, setSustData] = useState<SustainabilityData | null>(null);

  // Resolve Business Context
  useEffect(() => {
    async function init() {
      const user = getStoredUser();
      if (user?.business_id) {
        setBusinessId(user.business_id);
      } else {
        try {
          const businesses = await apiClient.get<any[]>("/business");
          if (businesses && businesses.length > 0) {
            setBusinessId(businesses[0].id);
          }
        } catch (err) {
          console.warn("Failed to load business context:", err);
        }
      }
    }
    init();
  }, []);

  // Fetch Sustainability Data
  const fetchSustainability = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get<SustainabilityData>(
        `/analytics/enterprise/sustainability?business_id=${businessId}&period=${chartPeriod}`
      );
      setSustData(res);
    } catch (err) {
      console.warn("Error fetching sustainability analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, chartPeriod]);

  useEffect(() => {
    fetchSustainability();
  }, [fetchSustainability]);

  const co2e = sustData?.co2e_total || 0;
  const targetCo2e = sustData?.target_co2e || 15000;
  const progressPercent = sustData?.progress_percent || 0;

  const trees = (sustData?.trees_equivalent || 0).toLocaleString("id-ID");
  const kmDriven = (sustData?.km_driven_equivalent || 0).toLocaleString("id-ID");
  const phoneHours = (sustData?.phone_hours_equivalent || 0).toLocaleString("id-ID");

  const trendLabels = sustData?.monthly_trend?.map(t => t.label) || ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
  const trendValues = sustData?.monthly_trend?.map(t => t.co2e) || [0, 0, 0, 0, 0, 0];

  const chartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Reduksi CO₂e (Kg)',
        data: trendValues,
        backgroundColor: 'rgba(16, 185, 129, 0.9)',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        border: { display: false }
      },
      x: {
        grid: { display: false },
        border: { display: false }
      }
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            Laporan Keberlanjutan (SDG)
            {loading && <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />}
          </h2>
          <p className="text-slate-500 mt-1">
            Memantau kontribusi perusahaan terhadap Tujuan Pembangunan Berkelanjutan (SDG 9 & 17).
          </p>
        </div>
      </div>

      {/* Hero Wrapped Highlight */}
      <Card className="relative overflow-hidden border border-slate-200 rounded-2xl shadow-sm group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest border border-emerald-100">
              <Sparkles className="w-3.5 h-3.5" />
              Annual Recap
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight tracking-tight">
              Kisah Keberlanjutan <br /> Bisnis Anda di Tahun 2024
            </h3>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed">
              Jelajahi dampak positif yang Anda buat selama setahun terakhir dalam format visual yang interaktif dan menarik.
            </p>
            <div className="pt-2">
              <Link href="/wrapped" target="_blank">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full px-8 shadow-sm transition-all hover:shadow cursor-pointer">
                  Buka Wrapped Sekarang
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-64 aspect-square bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center relative overflow-hidden shrink-0">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100/50" />
             <Gift className="w-24 h-24 text-emerald-600 relative z-10" />
             <div className="absolute top-4 right-4 animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Total CO2e & Target */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-8 text-white shadow-md relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 flex flex-col flex-1">
            <h3 className="text-lg font-semibold text-emerald-100/90 mb-2">Total Emisi Karbon Terhindari</h3>
            <div className="text-5xl font-extrabold mb-8 tracking-tight">
              {co2e.toLocaleString("id-ID")} <span className="text-2xl font-medium text-emerald-300">Kg CO₂e</span>
            </div>
            
            <div className="mt-auto bg-black/20 p-5 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-50">
                  <Target className="w-4 h-4 text-emerald-300" /> Target Tahunan
                </div>
                <span className="text-sm font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-xs text-emerald-100/70 mt-3 leading-relaxed">
                Anda telah mencapai {progressPercent}% dari target reduksi {targetCo2e.toLocaleString("id-ID")} Kg CO₂e yang direncanakan tahun ini.
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col">
          <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Tren Reduksi Emisi Karbon</h3>
              <p className="text-sm text-slate-500">Pergerakan Kg CO₂e terhindari</p>
            </div>
            <select 
               className="h-9 w-[160px] rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
               value={chartPeriod}
               onChange={e => setChartPeriod(e.target.value)}
             >
               <option value="6bulan">6 Bulan Terakhir</option>
               <option value="tahun_ini">Tahun Ini (2024)</option>
               <option value="semua">Semua Waktu</option>
             </select>
          </div>
          <div className="flex-1 w-full min-h-[280px]">
             <Bar data={chartData} options={chartOptions as any} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Analogi Dampak (EPA Equivalencies)</h3>
        <p className="text-slate-500 mb-6 max-w-4xl leading-relaxed">
          Skor metrik dikonversi ke analogi aktivitas sehari-hari menggunakan standar *Environmental Protection Agency* (EPA) untuk mempermudah pelaporan kepada pemangku kepentingan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tree Card */}
          <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
            <CardContent className="p-0">
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-white flex items-center justify-between border-b border-slate-100">
                <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TreePine className="w-7 h-7" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-700">{trees}</div>
                  <div className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mt-1">Bibit Pohon</div>
                </div>
              </div>
              <div className="p-5 bg-white text-sm text-slate-500 leading-relaxed">
                Setara dengan penyerapan emisi oleh {trees} bibit pohon yang ditanam dan tumbuh selama 10 tahun.
              </div>
            </CardContent>
          </Card>

          {/* Car Card */}
          <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
            <CardContent className="p-0">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-white flex items-center justify-between border-b border-slate-100">
                <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Car className="w-7 h-7" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-blue-700">{kmDriven}</div>
                  <div className="text-xs font-bold text-blue-600/70 uppercase tracking-widest mt-1">KM Mobil</div>
                </div>
              </div>
              <div className="p-5 bg-white text-sm text-slate-500 leading-relaxed">
                Bahan bakar bensin yang berhasil dihemat dari jarak {kmDriven} KM perjalanan mobil penumpang biasa.
              </div>
            </CardContent>
          </Card>

          {/* Phone Card */}
          <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group">
            <CardContent className="p-0">
              <div className="p-6 bg-gradient-to-br from-amber-50 to-white flex items-center justify-between border-b border-slate-100">
                <div className="w-14 h-14 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-amber-700">{phoneHours}</div>
                  <div className="text-xs font-bold text-amber-600/70 uppercase tracking-widest mt-1">Jam Daya HP</div>
                </div>
              </div>
              <div className="p-5 bg-white text-sm text-slate-500 leading-relaxed">
                Energi listrik yang digunakan untuk terus-menerus mengisi daya sebuah *smartphone* selama {phoneHours} jam.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
