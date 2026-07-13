"use client";

import React, { useState } from "react";
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
import { DollarSign, Wallet, Download, Activity, List, Plus, Search, ChevronLeft, ChevronRight, X, ArrowUpRight, ArrowDownRight } from "lucide-react";

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

export default function EnterpriseFinancePage() {
  const [txSearch, setTxSearch] = useState("");
  const [txFilter, setTxFilter] = useState<"all" | "in" | "out">("all");
  const [transactions, setTransactions] = useState([
    { id: 1, type: "out", category: "Gaji & Kompensasi", desc: "Gaji Staf HQ Bulan Juni", amount: 125000000, date: "2026-06-25 10:00" },
    { id: 2, type: "in", category: "Setoran Cabang", desc: "Agregasi Setoran Cabang Jakarta", amount: 350000000, date: "2026-06-24 18:00" },
    { id: 3, type: "out", category: "Marketing Nasional", desc: "Iklan Sosmed Kuartal 2", amount: 45000000, date: "2026-06-22 09:30" },
    { id: 4, type: "out", category: "Infrastruktur IT", desc: "Pembayaran Server Cloud", amount: 15000000, date: "2026-06-20 14:15" },
    { id: 5, type: "in", category: "Investasi", desc: "Suntikan Dana Seri A", amount: 2000000000, date: "2026-06-15 11:00" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    date: new Date().toISOString().substring(0, 10),
    type: "out" as "in" | "out",
    category: "Gaji & Kompensasi",
    desc: "",
    amount: ""
  });

  // Logic for transactions
  const filteredTransactions = transactions.filter(trx => {
    const matchesSearch = trx.desc.toLowerCase().includes(txSearch.toLowerCase()) || trx.category.toLowerCase().includes(txSearch.toLowerCase());
    const matchesFilter = txFilter === "all" || trx.type === txFilter;
    return matchesSearch && matchesFilter;
  });
  
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const currentTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.desc || !txForm.amount) return;
    
    const newTx = {
      id: Date.now(),
      type: txForm.type,
      category: txForm.category,
      desc: txForm.desc,
      amount: parseInt(txForm.amount),
      date: txForm.date + " " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };
    
    setTransactions([newTx, ...transactions]);
    setTxModalOpen(false);
    setTxForm({ ...txForm, desc: "", amount: "" });
  };

  const handleExport = () => {
    alert("Menyiapkan Laporan Keuangan Terpadu & Metrik Keberlanjutan (SDG)... Memulai unduhan PDF.");
  };

  // Cashflow Macro Data
  const cashflowData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
      {
        label: "Kas Masuk Agregat",
        data: [1.2, 1.4, 1.3, 1.5, 1.8, 2.1], // in Billions
        backgroundColor: "#10b981",
        borderRadius: 4,
      },
      {
        label: "Kas Keluar (Cabang + HQ)",
        data: [0.8, 0.9, 0.85, 1.0, 1.2, 1.3], // in Billions
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

  return (
    <div className="space-y-6">
      {/* Header with Title and Export Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Keuangan & Cashflow HQ</h1>
          <p className="text-slate-500 mt-1">Pantau aliran kas makro perusahaan dan transaksi tingkat pusat.</p>
        </div>
        
        <button 
          onClick={handleExport}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Laporan (SDG & Keuangan)
        </button>
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
            <div className="text-2xl font-black text-slate-900">Rp 2.140.500.000</div>
            <div className="flex items-center text-xs text-emerald-600 mt-1 font-semibold">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +15.2% YTD
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
            <div className="text-2xl font-black text-slate-900">Rp 425.200.000</div>
            <div className="flex items-center text-xs text-emerald-600 mt-1 font-semibold">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +8.5% YTD
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
            <div className="text-2xl font-black text-slate-900">Rp 185.000.000</div>
            <div className="flex items-center text-xs text-rose-600 mt-1 font-semibold">
              <ArrowDownRight className="w-3 h-3 mr-1" /> -2.1% efisiensi dari bulan lalu
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
                  className="px-8 py-3 rounded-xl font-bold bg-resurva-dark text-white hover:bg-resurva-dark-light transition-colors cursor-pointer shadow-md shadow-resurva-dark/20"
                >
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
