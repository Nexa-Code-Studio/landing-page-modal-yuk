"use client";

import React from "react";
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

// Register Chart.js components (including Filler for 'fill' option)
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

export default function AnalyticsPage() {
  // Mock Data untuk Bar Chart (Perbandingan Cabang)
  const branchWasteData = {
    labels: ["Cabang Malang", "Cabang Surabaya", "Cabang Jakarta", "Cabang Bandung"],
    datasets: [
      {
        label: "Limbah Terselamatkan (Kg)",
        data: [350, 420, 800, 290],
        backgroundColor: "rgba(79, 70, 229, 0.8)", // Indigo-600
        borderRadius: 4,
      },
      {
        label: "Limbah Terbuang (Kg)",
        data: [45, 80, 150, 30],
        backgroundColor: "rgba(239, 68, 68, 0.8)", // Red-500
        borderRadius: 4,
      },
    ],
  };

  // Mock Data untuk Line Chart (Tren Emisi)
  const emissionTrendData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
      {
        label: "Emisi Tereduksi (Kg CO2e)",
        data: [1200, 1500, 1400, 1800, 2200, 2500],
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

  return (
    <div className="space-y-8">
      {/* Macro Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase">
              Total Kerugian Finansial Terhindari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">Rp 42.500.000</div>
            <p className="text-sm text-green-600 mt-1">↑ 15% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase">
              Total Makanan Terselamatkan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">1,860 Kg</div>
            <p className="text-sm text-indigo-600 mt-1">~ 5.400 porsi makanan</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase">
              Total Emisi Karbon Tereduksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">10,600 Kg CO2e</div>
            <p className="text-sm text-teal-600 mt-1">Berkontribusi ke SDG 13</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Perbandingan Limbah Antar Cabang</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={branchWasteData} options={barOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tren Penurunan Emisi Karbon (6 Bulan Terakhir)</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={emissionTrendData} options={lineOptions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
