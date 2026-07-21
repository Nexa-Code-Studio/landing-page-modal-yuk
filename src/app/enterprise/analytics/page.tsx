"use client";

import React, { useState, useEffect, useCallback } from "react";
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

  // Fetch Analytics Data
  const fetchAnalytics = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get<AnalyticsData>(
        `/analytics/enterprise/waste-impact?business_id=${businessId}`
      );
      setAnalyticsData(res);
    } catch (err) {
      console.warn("Error fetching waste impact analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            Analitik Sampah & Dampak
            {loading && <Loader2 className="w-5 h-5 animate-spin text-resurva-dark" />}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau perbandingan limbah makanan, emisi karbon tereduksi, dan penghematan finansial antar cabang.
          </p>
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
              Tren Penurunan Emisi Karbon (6 Bulan Terakhir)
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
