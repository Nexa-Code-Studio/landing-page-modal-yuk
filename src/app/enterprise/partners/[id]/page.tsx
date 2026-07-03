"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, Package, Clock, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";

const MapDisplay = dynamic(() => import("@/components/ui/MapDisplay"), { ssr: false });

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.id as string;

  // Mock data for the specific partner
  const partner = {
    id: partnerId,
    name: partnerId === "M-001" ? "Toko Roti Berkah" : "Outlet Resurva",
    branch: "Malang",
    contact: "0812-3456-7890",
    email: "outlet@example.com",
    address: "Jl. Raya Suhat No. 1, Malang",
    category: "Bakery",
    status: "Aktif",
    joinDate: "15 Jan 2025",
    stats: {
      revenue: 4200000,
      savedKg: 350,
      co2e: 1250,
      activeProducts: 12
    },
    latitude: partnerId === "M-001" ? -7.940026 : -6.214620,
    longitude: partnerId === "M-001" ? 112.616335 : 106.815132,
  };

  return (
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            Detail Mitra: {partner.name}
            {partner.status === "Aktif" && <Badge className="bg-emerald-100 text-emerald-800 border-transparent">Aktif</Badge>}
          </h2>
          <p className="text-slate-500 text-sm">ID: {partner.id} • Bergabung sejak {partner.joinDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Info Profil */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3"/> Kategori & Lokasi</span>
              <p className="font-medium text-slate-900">{partner.category} - Cabang {partner.branch}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3"/> Alamat Lengkap</span>
              <p className="text-sm text-slate-900">{partner.address}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3"/> Kontak</span>
              <p className="font-medium text-slate-900">{partner.contact}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3"/> Email Bisnis</span>
              <p className="font-medium text-slate-900">{partner.email}</p>
            </div>
            {partner.latitude && partner.longitude && (
              <div className="pt-4 border-t border-slate-100 mt-4">
                <span className="text-xs text-slate-500 flex items-center gap-1 mb-2"><MapPin className="h-3 w-3"/> Peta Lokasi Titik</span>
                <MapDisplay latitude={partner.latitude} longitude={partner.longitude} name={partner.name} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Performance Stats */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Pendapatan Bulan Ini</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">Rp {(partner.stats.revenue / 1000000).toFixed(1)}Jt</h3>
                  </div>
                  <div className="p-2 bg-emerald-100 rounded-lg"><TrendingUp className="h-5 w-5 text-emerald-600"/></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Limbah Terselamatkan</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">{partner.stats.savedKg} Kg</h3>
                  </div>
                  <div className="p-2 bg-indigo-100 rounded-lg"><Package className="h-5 w-5 text-indigo-600"/></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Inventaris Saat Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <Clock className="h-8 w-8 text-amber-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-900">{partner.stats.activeProducts} Produk aktif di marketplace</h4>
                  <p className="text-sm text-amber-700">Terdapat 3 produk yang akan kedaluwarsa dalam waktu kurang dari 24 jam. Monitor penjualan produk ini dengan cermat.</p>
                </div>
                <Button variant="outline" className="ml-auto bg-white border-amber-300 text-amber-800 hover:bg-amber-100">
                  Lihat Produk
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
