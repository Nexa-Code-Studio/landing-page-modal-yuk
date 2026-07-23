"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { Bar, Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiClient, getStoredUser } from "@/lib/api";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

interface BranchWasteItem {
  branch_name: string;
  saved_kg: number;
  wasted_kg: number;
}

interface EmissionTrendItem {
  month: string;
  co2e_kg: number;
}

interface AnalyticsData {
  financial_loss_avoided: number;
  financial_loss_avoided_growth: number;
  food_saved_kg: number;
  portions_saved: number;
  co2e_reduced_kg: number;
  branch_comparison: BranchWasteItem[];
  emission_trend: EmissionTrendItem[];
}

export default function AnalyticsPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("6bulan");
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [isBranchOpen, setIsBranchOpen] = useState<boolean>(false);
  const [branchSearch, setBranchSearch] = useState<string>("");
  const branchDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside handler for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setIsBranchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Fetch Branches List
  useEffect(() => {
    async function fetchBranches() {
      if (!businessId) return;
      try {
        const res = await apiClient.get<{ items: { id: string; name: string }[] }>(
          `/stores?business_id=${businessId}&page_size=100`
        );
        if (res && res.items) {
          setBranches(res.items);
        }
      } catch (err) {
        console.warn("Failed to load branches list:", err);
      }
    }
    fetchBranches();
  }, [businessId]);

  // Fetch Analytics Data
  const fetchAnalytics = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let url = `/analytics/enterprise/waste-impact?business_id=${businessId}&period=${selectedPeriod}`;
      if (selectedBranch !== "all") {
        url += `&store_id=${selectedBranch}`;
      }
      const res = await apiClient.get<AnalyticsData>(url);
      setAnalyticsData(res);
    } catch (err) {
      console.warn("Error fetching waste impact analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, selectedBranch, selectedPeriod]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Bar Chart Data (Perbandingan Cabang)
  const branchLabels = analyticsData?.branch_comparison?.map(b => b.branch_name) || ["Belum Ada Cabang"];
  const branchSaved = analyticsData?.branch_comparison?.map(b => b.saved_kg) || [0];
  const branchWasted = analyticsData?.branch_comparison?.map(b => b.wasted_kg) || [0];

  const branchWasteData = {
    labels: branchLabels,
    datasets: [
      {
        label: "Limbah Terselamatkan (Kg)",
        data: branchSaved,
        backgroundColor: "rgba(79, 70, 229, 0.8)", // Indigo-600
        borderRadius: 4,
      },
      {
        label: "Limbah Terbuang / Kadaluarsa (Kg)",
        data: branchWasted,
        backgroundColor: "rgba(239, 68, 68, 0.8)", // Red-500
        borderRadius: 4,
      },
    ],
  };

  // Line Chart Data (Tren Emisi)
  const trendLabels = analyticsData?.emission_trend?.map(e => e.month) || ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];
  const trendValues = analyticsData?.emission_trend?.map(e => e.co2e_kg) || [0, 0, 0, 0, 0, 0];

  const emissionTrendData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Emisi Tereduksi (Kg CO2e)",
        data: trendValues,
        borderColor: "rgba(34, 197, 94, 1)", // Green-500
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: false },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const financialLoss = analyticsData?.financial_loss_avoided || 0;
  const growth = analyticsData?.financial_loss_avoided_growth || 15;
  const foodSaved = analyticsData?.food_saved_kg || 0;
  const portions = analyticsData?.portions_saved || 0;
  const co2e = analyticsData?.co2e_reduced_kg || 0;

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "tahun_ini":
        return "Tahun Ini";
      case "semua":
        return "Semua Waktu";
      case "6bulan":
      default:
        return "6 Bulan Terakhir";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            Analitik Sampah & Dampak
            {loading && <Loader2 className="w-5 h-5 animate-spin text-resurva-dark" />}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau perbandingan limbah makanan, emisi karbon tereduksi, dan penghematan finansial antar cabang.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Branch Filter */}
          <div className="flex flex-col gap-1" ref={branchDropdownRef}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cabang</span>
            <div className="relative">
              {/* Dropdown Button */}
              <button
                type="button"
                onClick={() => setIsBranchOpen(!isBranchOpen)}
                className="h-10 pl-3 pr-10 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-left cursor-pointer shadow-sm hover:border-slate-300 min-w-[200px] flex items-center justify-between w-full"
              >
                <span>
                  {selectedBranch === "all"
                    ? "Semua Cabang"
                    : branches.find((b) => b.id === selectedBranch)?.name || "Pilih Cabang"}
                </span>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 pointer-events-none">
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isBranchOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isBranchOpen && (
                <div className="absolute right-0 mt-1.5 w-full min-w-[220px] rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Search Input */}
                  <div className="p-2 border-b border-slate-100">
                    <input
                      type="text"
                      placeholder="Cari cabang..."
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Options List */}
                  <div className="max-h-60 overflow-y-auto py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBranch("all");
                        setIsBranchOpen(false);
                        setBranchSearch("");
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${
                        selectedBranch === "all" ? "text-indigo-600 font-semibold bg-indigo-50/40" : "text-slate-700"
                      }`}
                    >
                      Semua Cabang
                    </button>
                    {branches
                      .filter((b) =>
                        b.name.toLowerCase().includes(branchSearch.toLowerCase())
                      )
                      .map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setSelectedBranch(b.id);
                            setIsBranchOpen(false);
                            setBranchSearch("");
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${
                            selectedBranch === b.id ? "text-indigo-600 font-semibold bg-indigo-50/40" : "text-slate-700"
                          }`}
                        >
                          {b.name}
                        </button>
                      ))}
                    {branches.filter((b) =>
                      b.name.toLowerCase().includes(branchSearch.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-xs text-slate-400 text-center">
                        Tidak ada cabang ditemukan
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Period Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Periode</span>
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="h-10 pl-3 pr-10 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none appearance-none cursor-pointer shadow-sm hover:border-slate-300 min-w-[140px]"
              >
                <option value="6bulan">6 Bulan Terakhir</option>
                <option value="tahun_ini">Tahun Ini</option>
                <option value="semua">Semua Waktu</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Macro Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase">
              Total Kerugian Finansial Terhindari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">
              Rp {financialLoss.toLocaleString("id-ID")}
            </div>
            <p className="text-sm text-emerald-600 mt-1 font-semibold">
              ↑ {growth}% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase">
              Total Makanan Terselamatkan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">
              {foodSaved.toLocaleString("id-ID")} Kg
            </div>
            <p className="text-sm text-indigo-600 mt-1 font-semibold">
              ~ {portions.toLocaleString("id-ID")} porsi makanan
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase">
              Total Emisi Karbon Tereduksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">
              {co2e.toLocaleString("id-ID")} Kg CO2e
            </div>
            <p className="text-sm text-teal-600 mt-1 font-semibold">
              Berkontribusi ke SDG 13
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">
              Perbandingan Limbah Antar Cabang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={branchWasteData} options={barOptions} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">
              Tren Penurunan Emisi Karbon ({getPeriodLabel()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={emissionTrendData} options={lineOptions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
