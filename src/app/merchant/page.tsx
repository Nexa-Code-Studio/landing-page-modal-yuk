"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMerchantContext } from "@/lib/contexts/MerchantContext";

export default function MerchantDashboard() {
  const { products, orders } = useMerchantContext();
  const aiWidgetRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(aiWidgetRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.2,
    });
  });

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Produk di Inventaris
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pesanan Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pendapatan Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              Rp {orders.reduce((acc, order) => acc + order.totalAmount, 0).toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Stock Recommendation Widget */}
      <div ref={aiWidgetRef}>
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12h4l3-9 5 18 3-9h5"/>
                </svg>
              </div>
              <CardTitle className="text-indigo-900">AI Stock Recommendation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed max-w-2xl">
              Berdasarkan tren penjualan dan data historis minggu lalu, sistem merekomendasikan untuk 
              <span className="font-semibold text-indigo-700"> mengurangi produksi Roti Cokelat sebanyak 15% besok </span> 
              guna menghindari overstock, dan <span className="font-semibold text-green-700">meningkatkan stok Kopi Susu Gula Aren sebesar 10%</span> karena tingginya permintaan di akhir pekan.
            </p>
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
                Terapkan Rekomendasi
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium transition-colors">
                Lihat Detail Analitik
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
