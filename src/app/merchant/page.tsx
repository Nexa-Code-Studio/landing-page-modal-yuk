"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, CheckCircle, Truck, Leaf, AlertTriangle } from "lucide-react";
import { useMerchantContext } from "@/lib/contexts/MerchantContext";

export default function MerchantDashboard() {
  const { products, orders } = useMerchantContext();
  const aiWidgetRef = useRef<HTMLDivElement>(null);

  // Kalkulasi total item terjual & emisi diselamatkan
  const totalItemsSold = orders.reduce(
    (sum, order) => sum + order.items.reduce((acc, item) => acc + item.qty, 0),
    0
  );
  // Asumsi PRD: 0.5kg per item, Faktor Emisi = 27.0 kg CO2e/kg
  const carbonSaved = (totalItemsSold * 0.5 * 27.0).toFixed(1);

  // Helper untuk Tracker Kedaluwarsa
  const getExpiryStatus = (dateString?: string) => {
    if (!dateString) return { label: "Reguler", color: "bg-slate-100 text-slate-700 hover:bg-slate-200" };
    const hoursRemaining = (new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursRemaining <= 24) return { label: "Flash Sale", color: "bg-red-100 text-red-700 hover:bg-red-200" };
    if (hoursRemaining <= 72) return { label: "Surplus", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" };
    return { label: "Aman", color: "bg-green-100 text-green-700 hover:bg-green-200" };
  };

  const getOrderStatusIcon = (status: string) => {
    switch(status) {
      case "Mencari Kurir": return <Clock className="w-4 h-4 text-orange-500" />;
      case "Menuju Outlet": return <Truck className="w-4 h-4 text-blue-500" />;
      case "Pikap": return <Package className="w-4 h-4 text-purple-500" />;
      case "Selesai": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

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
    <div className="space-y-8 p-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <Card className="bg-resurva-green-muted border-resurva-dark-light/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-resurva-dark-light flex items-center gap-2">
              <Leaf className="w-4 h-4" /> Emisi Diselamatkan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-resurva-dark">{carbonSaved} <span className="text-sm font-medium text-resurva-dark/70">kg CO₂e</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-Time Expiry Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Real-Time Expiry Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Sisa Stok</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const status = getExpiryStatus(product.expiryDate);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${status.color} border-none`}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pesanan Aktif & Status Kurir */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Pesanan & Status Kurir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{order.id} - {order.customerName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getOrderStatusIcon(order.status)}
                    <span className="text-sm font-medium">{order.status}</span>
                  </div>
                </div>
              ))}
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
