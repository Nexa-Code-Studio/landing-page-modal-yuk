"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet, Activity, List, Plus, Search, ChevronLeft, ChevronRight, X, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { apiClient, getStoredUser } from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

interface TransactionItem {
  id: string | number;
  type: "in" | "out";
  category: string;
  desc: string;
  amount: number;
  date: string;
}

interface AnalyticsData {
  gmv: number;
  total_combined_profit: number;
  hq_operational_expense: number;
  cashflow_monthly: { month: string; cash_in: number; cash_out: number }[];
}

export default function EnterpriseFinancePage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  
  const [txSearch, setTxSearch] = useState("");
  const [txFilter, setTxFilter] = useState<"all" | "in" | "out">("all");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [txForm, setTxForm] = useState({
    date: new Date().toISOString().substring(0, 10),
    type: "out" as "in" | "out",
    category: "Gaji & Kompensasi",
    desc: "",
    amount: ""
  });

  // Resolve active Business ID
  useEffect(() => {
    async function initBusinessId() {
      const user = getStoredUser();
      if (user?.business_id) {
        setBusinessId(user.business_id);
        return;
      }
      try {
        const businesses = await apiClient.get<any[]>("/business");
        if (businesses && businesses.length > 0) {
          setBusinessId(businesses[0].id);
        }
      } catch (err) {
        console.warn("Could not load business context, setting default ID:", err);
      }
    }
    initBusinessId();
  }, []);

  // Fetch Analytics & HQ Transactions
  const fetchFinanceData = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Fetch Analytics
      const analyticsRes = await apiClient.get<AnalyticsData>(`/analytics/enterprise/finance?business_id=${businessId}`);
      setAnalytics(analyticsRes);

      // 2. Fetch HQ Transactions
      const rawTxs = await apiClient.get<any[]>(`/wallets/business/${businessId}/transactions?type=${txFilter}&search=${encodeURIComponent(txSearch)}`);
      
      const mappedTxs: TransactionItem[] = (rawTxs || []).map((t) => {
        const isCredit = t.type === "credit";
        const d = t.transaction_date ? new Date(t.transaction_date) : new Date(t.created_at);
        const dateStr = d.toLocaleDateString("id-ID", { year: "numeric", month: "2-digit", day: "2-digit" }) + " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        return {
          id: t.id,
          type: isCredit ? "in" : "out",
          category: t.category ?? (isCredit ? "Pemasukan Pusat" : "Pengeluaran Pusat"),
          desc: t.note || (isCredit ? "Pemasukan Pusat HQ" : "Pengeluaran HQ"),
          amount: Math.abs(t.amount),
          date: dateStr,
        };
      });

      setTransactions(mappedTxs);
    } catch (err) {
      console.warn("Failed to fetch enterprise finance data:", err);
      setAnalytics({
        gmv: 0,
        total_combined_profit: 0,
        hq_operational_expense: 0,
        cashflow_monthly: []
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [businessId, txFilter, txSearch]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  // Logic for transaction filtering & pagination
  const filteredTransactions = transactions.filter(trx => {
    const matchesSearch = trx.desc.toLowerCase().includes(txSearch.toLowerCase()) || trx.category.toLowerCase().includes(txSearch.toLowerCase());
    const matchesFilter = txFilter === "all" || trx.type === txFilter;
    return matchesSearch && matchesFilter;
  });
  
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const currentTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.desc || !txForm.amount || !businessId) return;

    setSubmitting(true);
    try {
      await apiClient.post(`/wallets/business/${businessId}/transactions`, {
        wallet_type: "hq",
        type: txForm.type === "in" ? "credit" : "debit",
        category: txForm.category,
        amount: parseInt(txForm.amount),
        note: txForm.desc,
        transaction_date: new Date(txForm.date).toISOString()
      });

      setTxModalOpen(false);
      setTxForm({ ...txForm, desc: "", amount: "" });
      fetchFinanceData();
    } catch (err: any) {
      alert(`Gagal menambah transaksi HQ: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };


  // Cashflow Macro Data formatting: Defaults to 0 if no data
  const hasCashflowData = analytics?.cashflow_monthly && analytics.cashflow_monthly.length > 0;
  const chartLabels = hasCashflowData ? analytics.cashflow_monthly.map(c => c.month) : ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];
  const cashInSeries = hasCashflowData ? analytics.cashflow_monthly.map(c => c.cash_in / 1_000_000_000) : [0, 0, 0, 0, 0, 0];
  const cashOutSeries = hasCashflowData ? analytics.cashflow_monthly.map(c => c.cash_out / 1_000_000_000) : [0, 0, 0, 0, 0, 0];

  const cashflowData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Kas Masuk Agregat",
        data: cashInSeries,
        backgroundColor: "#10b981",
        borderRadius: 4,
      },
      {
        label: "Kas Keluar (Cabang + HQ)",
        data: cashOutSeries,
        backgroundColor: "#f43f5e",
        borderRadius: 4,
      }
    ]
  };

  const cashflowOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (val: any) => "Rp " + val + "M" }
      }
    }
  };

  // Format currency display: Shows "..." when loading, "Rp 0" when 0, or formatted value
  const formatCurrency = (val: number | undefined) => {
    if (loading) return "Rp ...";
    if (val === undefined || val === null) return "Rp 0";
    return "Rp " + val.toLocaleString("id-ID");
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Export Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Keuangan & Cashflow HQ
            {loading && <Loader2 className="w-5 h-5 animate-spin text-resurva-dark" />}
          </h1>
          <p className="text-slate-500 mt-1">Pantau aliran kas makro perusahaan dan transaksi tingkat pusat.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GMV */}
        <Card className="border-slate-200/60 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="w-16 h-16" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Gross Merchandise Value (GMV)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(analytics?.gmv)}
            </div>
            <div className="flex items-center text-xs text-slate-400 mt-1 font-semibold">
              <Activity className="w-3 h-3 mr-1" /> Total Penjualan Agregat
            </div>
          </CardContent>
        </Card>

        {/* Total Laba Gabungan */}
        <Card className="border-slate-200/60 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Wallet className="w-16 h-16" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Laba Gabungan Cabang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(analytics?.total_combined_profit)}
            </div>
            <div className="flex items-center text-xs text-slate-400 mt-1 font-semibold">
              <Wallet className="w-3 h-3 mr-1" /> Net Profit Cabang
            </div>
          </CardContent>
        </Card>

        {/* Beban HQ */}
        <Card className="border-slate-200/60 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign className="w-16 h-16" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Beban Operasional HQ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(analytics?.hq_operational_expense)}
            </div>
            <div className="flex items-center text-xs text-slate-400 mt-1 font-semibold">
              <DollarSign className="w-3 h-3 mr-1" /> Pengeluaran HQ Pusat
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cashflow Chart (Full Width) */}
      <Card className="border-slate-200/60 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-50 pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-resurva-dark" />
            Arus Kas Makro (In vs Out)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-72 w-full">
            <Bar data={cashflowData} options={cashflowOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table with Pagination */}
      <Card className="border-slate-200/60 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-50 pb-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2 shrink-0">
              <List className="w-4 h-4 text-resurva-dark" />
              Riwayat Transaksi HQ
            </CardTitle>
            
            <div className="flex flex-col items-end gap-3 w-full lg:w-auto">
              <button 
                onClick={() => setTxModalOpen(true)}
                className="bg-resurva-dark hover:bg-resurva-dark-light text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer self-end"
              >
                <Plus className="w-4 h-4" /> Tambah Transaksi HQ
              </button>

              <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari transaksi HQ..." 
                    className="pl-9 w-full h-10 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-resurva-dark transition-colors"
                    value={txSearch}
                    onChange={e => setTxSearch(e.target.value)}
                  />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 w-full sm:w-auto justify-center sm:justify-start">
                  <button
                    onClick={() => setTxFilter("all")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${txFilter === "all" ? "bg-white text-resurva-dark shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >Semua</button>
                  <button
                    onClick={() => setTxFilter("in")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${txFilter === "in" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >Masuk</button>
                  <button
                    onClick={() => setTxFilter("out")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${txFilter === "out" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >Keluar</button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Tanggal</th>
                  <th className="px-6 py-4 font-bold">Deskripsi</th>
                  <th className="px-6 py-4 font-bold">Kategori</th>
                  <th className="px-6 py-4 font-bold text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{trx.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{trx.desc}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {trx.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-bold text-right whitespace-nowrap ${trx.type === "in" ? "text-emerald-600" : "text-rose-600"}`}>
                      {trx.type === "in" ? "+" : "-"} Rp {trx.amount.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
                {currentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      {loading ? "Memuat transaksi HQ..." : "Tidak ada transaksi HQ ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-xl">
            <span className="text-sm text-slate-500">
              Menampilkan {filteredTransactions.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} dari {filteredTransactions.length} transaksi
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors bg-white shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors bg-white shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add HQ Transaction Modal */}
      {txModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setTxModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Tambah Transaksi HQ</h3>
              <button onClick={() => setTxModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleTxSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tanggal</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resurva-dark"
                    value={txForm.date}
                    onChange={e => setTxForm({...txForm, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Jenis Transaksi</label>
                  <select 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resurva-dark font-medium"
                    value={txForm.type}
                    onChange={e => {
                      const newType = e.target.value as "in" | "out";
                      setTxForm({
                        ...txForm, 
                        type: newType, 
                        category: newType === "in" ? "Setoran Cabang" : "Gaji & Kompensasi" 
                      });
                    }}
                  >
                    <option value="in" className="text-emerald-600">Pemasukan Pusat (+)</option>
                    <option value="out" className="text-rose-600">Pengeluaran Pusat (-)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kategori</label>
                <select 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resurva-dark"
                  value={txForm.category}
                  onChange={e => setTxForm({...txForm, category: e.target.value})}
                >
                  {txForm.type === "in" ? (
                    <>
                      <option value="Setoran Cabang">Setoran Cabang</option>
                      <option value="Investasi">Pendanaan / Investasi</option>
                      <option value="Sponsorship">Sponsorship Terpusat</option>
                      <option value="Lainnya">Pemasukan Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option value="Gaji & Kompensasi">Gaji Staf HQ</option>
                      <option value="Marketing Nasional">Biaya Marketing Nasional</option>
                      <option value="Infrastruktur IT">Sewa Server & Infrastruktur IT</option>
                      <option value="Operasional Kantor">Biaya Operasional Kantor HQ</option>
                      <option value="Lainnya">Pengeluaran Lainnya</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Deskripsi / Catatan</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Pembayaran Gaji Bulan Juni"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resurva-dark"
                  value={txForm.desc}
                  onChange={e => setTxForm({...txForm, desc: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nominal (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500 font-bold">Rp</span>
                  <input 
                    type="number" 
                    required
                    min="1"
                    placeholder="15000000"
                    className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resurva-dark text-lg font-bold"
                    value={txForm.amount}
                    onChange={e => setTxForm({...txForm, amount: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setTxModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl font-bold bg-resurva-dark text-white hover:bg-resurva-dark-light transition-colors cursor-pointer shadow-md shadow-resurva-dark/20 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Transaksi HQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
