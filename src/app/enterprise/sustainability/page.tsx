"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SustainabilityPage() {
  const [co2e, setCo2e] = useState(10600); // Mock value for Enterprise total

  // EPA Conversion factors
  // 1 kg CO2e ≈ 0.016 pohon
  // 1 kg CO2e ≈ 4.1 km mobil
  // 1 kg CO2e ≈ 120 jam smartphone
  const trees = (co2e * 0.016).toFixed(0);
  const kmDriven = (co2e * 4.1).toLocaleString("id-ID");
  const phoneHours = (co2e * 120).toLocaleString("id-ID");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Laporan Keberlanjutan (SDG)</h2>
        <p className="text-slate-500">
          Memantau kontribusi perusahaan terhadap Tujuan Pembangunan Berkelanjutan (SDG 9 & 17).
        </p>
      </div>

      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl p-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <h3 className="text-xl font-semibold mb-2">Total Emisi Karbon Terhindari</h3>
          <div className="text-5xl font-extrabold mb-4">{co2e.toLocaleString("id-ID")} <span className="text-2xl font-medium text-emerald-300">Kg CO2e</span></div>
          <p className="text-emerald-100/80 leading-relaxed">
            Pencapaian ini dihitung melalui metode Life Cycle Assessment (LCA) yang mengonversi berat makanan surplus yang diselamatkan menjadi nilai emisi gas rumah kaca yang berhasil dicegah jika makanan tersebut berakhir di TPA (Tempat Pembuangan Akhir).
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">EPA Equivalencies Engine Visualizer</h3>
        <p className="text-slate-600 mb-6 max-w-4xl">
          Untuk mempermudah pemahaman publik, skor mentah Kg CO2e dikonversi ke dalam wujud analogi aktivitas sehari-hari menggunakan standar konversi *Environmental Protection Agency* (EPA). 
          Dampak positif operasional Anda setara dengan:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tree Card */}
          <Card className="overflow-hidden border-2 border-green-100 hover:border-green-300 transition-colors">
            <div className="h-32 bg-green-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M12 22v-8"/>
                <path d="M12 14c-2.5-1.5-5-1-7-3 2-2 2-5 3-7 1.5 1 4 1 6 0 1 2 1 5 3 7-2 2-4.5 1.5-7 3Z"/>
              </svg>
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold text-green-700">{trees}</CardTitle>
              <CardDescription className="text-sm font-medium text-slate-600 uppercase tracking-wider">Bibit Pohon</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-slate-500">
              Diserap oleh bibit pohon yang tumbuh selama 10 tahun.
            </CardContent>
          </Card>

          {/* Car Card */}
          <Card className="overflow-hidden border-2 border-blue-100 hover:border-blue-300 transition-colors">
            <div className="h-32 bg-blue-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H8.3a2 2 0 0 0-1.6.8L4 11l-5.16.86a1 1 0 0 0-.84.99V16h3"/>
                <circle cx="6.5" cy="16.5" r="2.5"/>
                <circle cx="16.5" cy="16.5" r="2.5"/>
              </svg>
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold text-blue-700">{kmDriven} KM</CardTitle>
              <CardDescription className="text-sm font-medium text-slate-600 uppercase tracking-wider">Perjalanan Mobil</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-slate-500">
              Bahan bakar yang dihemat dari perjalanan mobil penumpang biasa.
            </CardContent>
          </Card>

          {/* Phone Card */}
          <Card className="overflow-hidden border-2 border-amber-100 hover:border-amber-300 transition-colors">
            <div className="h-32 bg-amber-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
                <path d="M12 18h.01"/>
                <path d="M10 9l1 3 3-2"/>
              </svg>
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold text-amber-700">{phoneHours} Jam</CardTitle>
              <CardDescription className="text-sm font-medium text-slate-600 uppercase tracking-wider">Pengisian Daya</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-slate-500">
              Energi listrik yang digunakan untuk mengisi daya smartphone.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
