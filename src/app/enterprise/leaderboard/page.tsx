"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Package, Leaf, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { apiClient, getStoredUser } from "@/lib/api";

interface LeaderboardItem {
  rank: number;
  store_id: string;
  name: string;
  category: string;
  revenue: number;
  saved_kg: number;
  co2e: number;
}

interface LeaderboardData {
  period: string;
  category_filter: string;
  items: LeaderboardItem[];
}

export default function LeaderboardPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterPeriod, setFilterPeriod] = useState("Bulan Ini");
  const [filterCategory, setFilterCategory] = useState("Semua Kategori");
  const [categories, setCategories] = useState<string[]>(["Semua Kategori"]);
  const [leaderboardItems, setLeaderboardItems] = useState<LeaderboardItem[]>([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Resolve Business Context & Categories
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

      try {
        const catList = await apiClient.get<string[]>("/stores/categories");
        if (catList && catList.length > 0) {
          setCategories(["Semua Kategori", ...catList]);
        }
      } catch (err) {
        console.warn("Failed to load categories:", err);
      }
    }
    init();
  }, []);

  // Fetch Leaderboard from Backend API
  const fetchLeaderboard = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const encodedPeriod = encodeURIComponent(filterPeriod);
      const encodedCategory = encodeURIComponent(filterCategory);
      const res = await apiClient.get<LeaderboardData>(
        `/analytics/enterprise/leaderboard?business_id=${businessId}&period=${encodedPeriod}&category=${encodedCategory}`
      );
      setLeaderboardItems(res?.items || []);
      setCurrentPage(1); // Reset to page 1 on filter change
    } catch (err) {
      console.warn("Error fetching enterprise leaderboard:", err);
      setLeaderboardItems([]);
    } finally {
      setLoading(false);
    }
  }, [businessId, filterPeriod, filterCategory]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const top3 = leaderboardItems.slice(0, 3);

  // Pagination Calculations
  const totalItems = leaderboardItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedItems = leaderboardItems.slice(startIndex, endIndex);

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Leaderboard Kinerja Mitra
            {loading && <Loader2 className="w-5 h-5 animate-spin text-resurva-dark" />}
          </h2>
          <p className="text-slate-500 mt-1">
            Peringkat mitra berdasarkan performa reduksi sampah dan kontribusi pendapatan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Periode</label>
            <select 
              className="flex h-10 w-[140px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-resurva-dark cursor-pointer"
              value={filterPeriod}
              onChange={e => setFilterPeriod(e.target.value)}
            >
              <option value="Bulan Ini">Bulan Ini</option>
              <option value="Bulan Lalu">Bulan Lalu</option>
              <option value="Tahun Ini">Tahun Ini</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Kategori</label>
            <select 
              className="flex h-10 w-[150px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-resurva-dark cursor-pointer"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {top3.length === 0 && !loading && (
          <div className="md:col-span-3 bg-white border border-slate-200/60 rounded-2xl p-8 text-center text-slate-400">
            Belum ada data mitra untuk peringkat 3 teratas.
          </div>
        )}
        {top3.map((mitra, index) => {
          const isFirst = index === 0;
          const isSecond = index === 1;

          return (
            <Card key={mitra.store_id || index} className={`relative overflow-hidden border-2 ${isFirst ? 'border-amber-300 shadow-amber-100/50' : isSecond ? 'border-slate-300 shadow-slate-100/50' : 'border-orange-300 shadow-orange-100/50'} shadow-md transform transition-all hover:-translate-y-1 bg-white rounded-2xl`}>
              {/* Medal Indicator */}
              <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full flex justify-end items-start p-3 ${isFirst ? 'bg-amber-100' : isSecond ? 'bg-slate-100' : 'bg-orange-100'}`}>
                <span className="text-2xl drop-shadow-sm">
                  {isFirst ? '🥇' : isSecond ? '🥈' : '🥉'}
                </span>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                  <span className={isFirst ? 'text-amber-600' : isSecond ? 'text-slate-600' : 'text-orange-600'}>
                    Peringkat #{mitra.rank}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{mitra.category}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-5 pr-10 truncate">{mitra.name}</h3>
                
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium">Pendapatan</span>
                    </div>
                    <span className="font-bold text-slate-900">Rp {mitra.revenue.toLocaleString("id-ID")}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Package className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium">Diselamatkan</span>
                    </div>
                    <span className="font-bold text-slate-900">{mitra.saved_kg} Kg</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium">Reduksi CO₂e</span>
                    </div>
                    <span className="font-bold text-slate-900">{mitra.co2e.toLocaleString('id-ID')} Kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Daftar Lengkap Peringkat
          </h3>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 font-semibold shadow-sm">
              Total: {totalItems} Mitra
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Baris per halaman:</span>
              <select
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-resurva-dark cursor-pointer"
                value={itemsPerPage}
                onChange={e => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-white">
            <TableRow>
              <TableHead className="w-16 text-center font-bold">Rank</TableHead>
              <TableHead className="font-bold">Nama Mitra / Cabang</TableHead>
              <TableHead className="font-bold text-center">Kategori</TableHead>
              <TableHead className="text-right font-bold">Pendapatan</TableHead>
              <TableHead className="text-right font-bold">Limbah Diselamatkan</TableHead>
              <TableHead className="text-right font-bold">Emisi CO₂e</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400 py-10">
                  {loading ? "Memuat data leaderboard..." : "Tidak ada data mitra ditemukan untuk periode ini."}
                </TableCell>
              </TableRow>
            )}
            {paginatedItems.map((mitra) => (
              <TableRow key={mitra.store_id || mitra.name} className="hover:bg-slate-50/80 transition-colors">
                <TableCell className="text-center font-bold text-slate-700">
                  #{mitra.rank}
                </TableCell>
                <TableCell className="font-semibold text-slate-900">{mitra.name}</TableCell>
                <TableCell className="text-center">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">{mitra.category}</span>
                </TableCell>
                <TableCell className="text-right font-bold text-emerald-600">
                  Rp {mitra.revenue.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right font-medium text-slate-700">
                  {mitra.saved_kg.toLocaleString("id-ID")} Kg
                </TableCell>
                <TableCell className="text-right text-slate-600 font-medium">
                  {mitra.co2e.toLocaleString("id-ID")} Kg
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls Footer */}
        {totalItems > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-4 text-sm">
            <div className="text-slate-500 font-medium text-xs sm:text-sm">
              Menampilkan <span className="font-bold text-slate-800">{totalItems === 0 ? 0 : startIndex + 1}</span> - <span className="font-bold text-slate-800">{endIndex}</span> dari <span className="font-bold text-slate-800">{totalItems}</span> mitra
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="h-8 px-3 text-xs font-medium cursor-pointer border-slate-200 hover:bg-white"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Sebelum
              </Button>

              <div className="text-xs font-semibold text-slate-700 px-2">
                Halaman {currentPage} dari {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="h-8 px-3 text-xs font-medium cursor-pointer border-slate-200 hover:bg-white"
              >
                Lanjut <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
