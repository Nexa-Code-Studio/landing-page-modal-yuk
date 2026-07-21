"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { redirect } from "next/navigation";
import gsap from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  CheckCircle, 
  Truck, 
  Leaf, 
  AlertTriangle, 
  Banknote, 
  ShoppingBag, 
  Sparkles,
  ArrowRight,
  Clock
} from "lucide-react";
import { useMerchantContext, Product } from "@/lib/contexts/MerchantContext";

const TRANSLATIONS = {
  en: {
    totalProducts: "Total Products in Inventory",
    activeOrders: "New Orders Today",
    todayRevenue: "Today's Revenue",
    emissionsSaved: "Emissions Saved",
    expiryTracker: "Real-Time Expiry Tracker",
    ordersStatus: "New Orders Today",
    product: "Product",
    remainingStock: "Remaining Stock",
    status: "Status",
    batch: "Batch",
    noNewOrders: "No new orders received today.",
    aiTitle: "AI Business Assistant Recommendations",
    aiText: "Based on store sales data, stock, and waste trends, the assistant has generated general insights to help optimize your store operations.",
    detailAnalytic: "View Analytics Details",
    regular: "Regular",
    surplus: "Surplus",
    safe: "Safe",
    orderType: "Type",
    payment: "Payment",
    items: "Items",
    seeMore: "See more in",
    ordersMenu: "Orders menu",
    inventoryMenu: "Inventory menu",
    pcs: "pcs",
    productHeader: "Product",
    batchQtyHeader: "Batch Qty",
    statusHeader: "Status",
    expiryHeader: "Expiry",
    totalStockHeader: "Remaining Stock (Total)",
  },
  id: {
    totalProducts: "Total Produk di Inventaris",
    activeOrders: "Pesanan Baru Hari Ini",
    todayRevenue: "Pendapatan Hari Ini",
    emissionsSaved: "Emisi Diselamatkan",
    expiryTracker: "Real-Time Expiry Tracker",
    ordersStatus: "Pesanan Baru Hari Ini",
    product: "Produk",
    remainingStock: "Sisa Stok",
    status: "Status",
    batch: "Batch",
    noNewOrders: "Belum ada pesanan masuk hari ini.",
    aiTitle: "AI Business Assistant Recommendations",
    aiText: "Berdasarkan data penjualan toko, ketersediaan stok, dan tren pembuangan makanan, asisten telah merumuskan rekomendasi umum untuk toko Anda.",
    detailAnalytic: "Lihat Detail Analitik",
    regular: "Reguler",
    surplus: "Surplus",
    safe: "Aman",
    orderType: "Tipe",
    payment: "Pembayaran",
    items: "Item",
    seeMore: "Selengkapnya lihat di",
    ordersMenu: "menu Pesanan",
    inventoryMenu: "menu Inventaris",
    pcs: "pcs",
    productHeader: "Produk",
    batchQtyHeader: "Jumlah Batch",
    statusHeader: "Status",
    expiryHeader: "Kedaluwarsa",
    totalStockHeader: "Sisa Stok (Total)",
  }
};

import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function MerchantDashboard() {
  const { products, orders, newOrdersCount, newOrdersPreview } = useMerchantContext();
  const aiWidgetRef = useRef<HTMLDivElement>(null);
  const { lang } = useLanguage();


  const t = TRANSLATIONS[lang];

  // Pendapatan hari ini: pesanan selesai/sedang berlangsung hari ini
  const todayOrders = orders.filter((order) => {
    const isToday = new Date(order.createdAt).toDateString() === new Date().toDateString();
    const isActive = order.status !== "Dibatalkan";
    return isToday && isActive;
  });
  const todayRevenue = todayOrders.reduce((acc, order) => acc + order.totalAmount, 0);

  // Calculate total items sold & emissions saved
  const totalItemsSold = orders.reduce(
    (sum, order) => sum + order.items.reduce((acc, item) => acc + item.qty, 0),
    0
  );
  // Asumsi PRD: 0.5kg per item, Faktor Emisi = 27.0 kg CO2e/kg
  const carbonSaved = (totalItemsSold * 0.5 * 27.0).toFixed(1);

  // Helper to generate multiple batches for a product to demonstrate Surplus & Regular status
  const getMockBatches = (product: Product) => {
    if (product.batches && product.batches.length > 0) {
      return product.batches.map(b => {
        let expiryText = "-";
        if (b.expiryDate) {
          const diffHours = (new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60);
          if (diffHours <= 24 && diffHours > 0) {
            expiryText = lang === "en" ? `${Math.ceil(diffHours)}h left` : `${Math.ceil(diffHours)} jam lagi`;
          } else if (diffHours > 24) {
            const diffDays = Math.ceil(diffHours / 24);
            expiryText = lang === "en" ? `${diffDays} days left` : `${diffDays} hari lagi`;
          } else {
            expiryText = lang === "en" ? "Expired" : "Kedaluwarsa";
          }
        }
        return {
          qty: b.qty,
          status: b.menuType === "Surplus" ? t.surplus : t.regular,
          expiry: expiryText
        };
      });
    }
    return [
      { qty: product.quantity, status: t.regular, expiry: "-" }
    ];
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
    <div className="space-y-8 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Merchant</h1>
          <p className="text-slate-500 mt-1">Pantau pesanan baru, kapasitas produk, dan wawasan harian toko Anda.</p>
        </div>
      </div>

      {/* Overview Cards with Premium Background Icons */}
      {/* Overview Cards with Premium Background Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-slate-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              {t.totalProducts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{products.length}</div>
            <p className="text-xs text-slate-500 mt-1 font-semibold flex items-center gap-1">
              Kapasitas Tersedia
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              {t.activeOrders}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{newOrdersCount}</div>
            <p className="text-xs text-blue-600 mt-1 font-semibold flex items-center gap-1">
              Butuh konfirmasi
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-500" />
              {t.todayRevenue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              Rp {todayRevenue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
              Pendapatan harian
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-emerald-50/40 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" /> 
              {t.emissionsSaved}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{carbonSaved} <span className="text-sm font-semibold text-emerald-700/80">kg CO₂e</span></div>
            <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
              Dampak positif
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-Time Expiry Tracker */}
        <Card className="shadow-sm border-slate-200/60">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {t.expiryTracker}
            </CardTitle>
            <Link href="/merchant/inventory" className="text-xs text-blue-600 hover:underline font-semibold">
              {t.seeMore} {t.inventoryMenu}
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-slate-100">
                    <TableHead className="text-slate-500 font-bold px-4 py-3 text-sm">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        {t.product}
                      </span>
                    </TableHead>
                    <TableHead className="text-slate-500 font-bold px-4 py-3 text-sm">{lang === "en" ? "Batches & Expiry" : "Batch & Kedaluwarsa"}</TableHead>
                    <TableHead className="text-slate-500 font-bold px-4 py-3 text-sm text-right">{t.remainingStock}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.slice(0, 5).map((product) => {
                    const batches = getMockBatches(product);
                    return (
                      <TableRow key={product.id} className="hover:bg-slate-50/50 border-b border-slate-100">
                        <TableCell className="font-semibold py-4 align-top">
                          <span className="text-slate-800 text-sm block">{product.name}</span>
                          <span className="text-xs text-slate-400 font-normal mt-0.5">{product.category}</span>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex flex-col gap-2">
                            {batches.map((batch, index) => (
                              <div key={index} className="flex items-center gap-2.5 text-xs">
                                <span className="font-bold text-slate-700 bg-slate-150/40 px-1.5 py-0.5 rounded">
                                  {batch.qty} {t.pcs}
                                </span>
                                <Badge className={`border-none text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                  batch.status === t.surplus 
                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-100" 
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                                }`}>
                                  {batch.status.toUpperCase()}
                                </Badge>
                                <span className="text-slate-400 font-medium">{batch.expiry === "-" ? "---" : batch.expiry}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4 font-bold text-right text-slate-800">
                          {product.quantity} {t.pcs}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pesanan Baru Hari Ini */}
        <Card className="shadow-sm border-slate-200/60 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
              {t.ordersStatus}
            </CardTitle>
            <Link href="/merchant/orders" className="text-xs text-blue-600 hover:underline font-semibold">
              {t.seeMore} {t.ordersMenu}
            </Link>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {newOrdersPreview.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-400">
                  <ShoppingBag className="w-12 h-12 text-slate-200 mb-2" />
                  <p className="text-sm font-medium">{t.noNewOrders}</p>
                </div>
              ) : (
                newOrdersPreview.map((order) => (
                  <Link key={order.id} href="/merchant/orders" className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-blue-50/50 transition-colors shadow-sm bg-white">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-800 truncate">
                        {order.dailyCode ? `#${order.dailyCode}` : order.id.slice(0, 8)} — {order.customerName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                      </p>
                    </div>
                    <span className="ml-2 shrink-0 text-xs text-slate-400 font-medium whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}, {new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </Link>
                ))
              )}
              {newOrdersCount > 5 && (
                <Link href="/merchant/orders" className="block text-center text-xs text-blue-600 font-bold hover:underline py-2">
                  +{newOrdersCount - 5} pesanan lainnya → Lihat semua
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Business Assistant Widget */}
      <div ref={aiWidgetRef}>
        <Card className="bg-gradient-to-br from-indigo-50/60 via-white to-indigo-50/20 border-indigo-150/40 shadow-sm relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-150/40 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <CardTitle className="text-indigo-950 font-extrabold text-lg">{t.aiTitle}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 leading-relaxed text-sm max-w-3xl">
              {t.aiText}
            </p>
            <div className="mt-5 flex gap-3">
              <Link 
                href="/merchant/analytics" 
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
              >
                {t.detailAnalytic} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
