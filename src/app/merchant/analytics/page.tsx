"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Line, Bar } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, MessageSquare, Send, X, Bot, RefreshCw, ChevronLeft, ChevronRight,
  Wallet, TrendingUp, PieChart, Activity, ArrowUpRight, ArrowDownRight, DollarSign, List, BadgeDollarSign, Plus, Search
} from "lucide-react";

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

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

const TRANSLATIONS = {
  en: {
    title: "Store Analytics & Finance",
    description: "Manage your cashflow, monitor sales trends, and get AI business insights.",
    tabFinance: "Finance & Cashflow",
    tabSales: "Sales Trends",
    tabAI: "AI Insights",
    netProfit: "Net Profit",
    totalRevenue: "Total Revenue",
    totalExpense: "Operational Expenses",
    surplusRecovery: "Surplus Recovery",
    cashflowChart: "Weekly Cashflow (In vs Out)",
    recentTransactions: "Recent Transactions",
    salesTrendWeekly: "Weekly Sales Trend (Rp)",
    salesTrendMonthly: "Monthly Sales Trend (Rp)",
    aiInsightTitle: "AI Business Assistant Analysis",
    insight1Title: "Sales & Stock Optimization",
    insight1Desc: "Based on weekly trends, bakery items experience a 15% demand drop on Mondays. We recommend reducing the morning prep batch size for Chocolate Bread by 15% next Monday.",
    insight2Title: "Surplus Conversion Rate",
    insight2Desc: "Your surplus conversion is at 84%, which is excellent. You saved 12.5 kg of food waste this week, resulting in an additional Rp 320,000 in recovery revenue.",
    chatWelcome: "Hello! I am your AI Business Assistant. Ask me anything about your sales performance, inventory expiry tracking, or how to reduce food surplus waste.",
    chatInputPlaceholder: "Ask the AI assistant...",
    send: "Send",
    chatTitle: "AI Business Assistant",
    mockResponse1: "Your Chocolate Bread surplus conversions are highest on Friday evenings between 5 PM and 8 PM. Setting a flash sale during these hours yields a 95% sell-out rate.",
    mockResponse2: "Currently, 2 products are nearing expiration within 24 hours. I suggest offering them as a 'Surplus Combo' via POS take-away to quickly clear stock.",
    mockResponseDefault: "Based on store data, your average daily profit is Rp 450,000. Heavy Meal category contributes 48% of total revenue. Reducing surplus wastage could increase profit margin by up to 6.2%.",
    weekly: "Weekly",
    monthly: "Monthly",
  },
  id: {
    title: "Analitik & Keuangan Toko",
    description: "Kelola arus kas, pantau tren penjualan, dan dapatkan wawasan bisnis dari AI.",
    tabFinance: "Keuangan & Cashflow",
    tabSales: "Tren Penjualan",
    tabAI: "AI Insights",
    netProfit: "Laba Bersih",
    totalRevenue: "Pendapatan Total",
    totalExpense: "Pengeluaran Operasional",
    surplusRecovery: "Pemulihan Surplus",
    cashflowChart: "Arus Kas Mingguan (Masuk vs Keluar)",
    recentTransactions: "Riwayat Transaksi Terakhir",
    salesTrendWeekly: "Tren Penjualan Mingguan (Rp)",
    salesTrendMonthly: "Tren Penjualan Bulanan (Rp)",
    aiInsightTitle: "Analisis AI Business Assistant",
    insight1Title: "Optimasi Penjualan & Ketersediaan Stok",
    insight1Desc: "Berdasarkan tren mingguan, produk bakery mengalami penurunan permintaan sebesar 15% pada hari Senin. Direkomendasikan untuk mengurangi volume produksi Roti Cokelat sebanyak 15% pada Senin depan.",
    insight2Title: "Tingkat Konversi Produk Surplus",
    insight2Desc: "Konversi surplus toko Anda berada di angka 84% (Sangat Baik). Anda menyelamatkan 12.5 kg makanan minggu ini, menghasilkan tambahan pemulihan pendapatan sebesar Rp 320.000.",
    chatWelcome: "Halo! Saya AI Business Assistant Anda. Tanyakan apa saja tentang kinerja penjualan, pemantauan tanggal kedaluwarsa, atau cara mengurangi limbah surplus makanan.",
    chatInputPlaceholder: "Tanya asisten AI...",
    send: "Kirim",
    chatTitle: "AI Business Assistant",
    mockResponse1: "Penjualan Roti Cokelat surplus tertinggi terjadi pada Jumat malam pukul 17.00 - 20.00. Mengaktifkan Flash Sale pada jam tersebut meningkatkan tingkat kelarisan hingga 95%.",
    mockResponse2: "Saat ini ada 2 produk yang akan kedaluwarsa dalam 24 jam. Saya sarankan Anda membuat promo 'Paket Bundling Surplus' di POS untuk menghabiskan stok dengan cepat.",
    mockResponseDefault: "Berdasarkan data toko Anda, rata-rata laba harian Anda adalah Rp 450.000. Kategori Makanan Berat menyumbang 48% dari total pendapatan. Mengurangi surplus terbuang dapat menaikkan margin hingga 6,2%.",
    weekly: "Mingguan",
    monthly: "Bulanan",
  }
};

export default function StoreAnalyticsPage() {
  const [lang, setLang] = useState<"en" | "id">("en");
  const [activeTab, setActiveTab] = useState<"finance" | "sales" | "ai">("finance");
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Charts state
  const [timeFrame, setTimeFrame] = useState<"weekly" | "monthly">("weekly");
  const [dateOffset, setDateOffset] = useState(0);

  // Transactions State
  const [txSearch, setTxSearch] = useState("");
  const [txFilter, setTxFilter] = useState<"all" | "in" | "out">("all");
  const [transactions, setTransactions] = useState([
    { id: 1, type: "in", category: "Penjualan POS", desc: "Penjualan POS #1024", amount: 150000, date: "2026-06-26 14:20" },
    { id: 2, type: "out", category: "Bahan Baku", desc: "Beli Bahan Baku Tepung", amount: 85000, date: "2026-06-26 10:15" },
    { id: 3, type: "in", category: "Penjualan Lainnya", desc: "Penjualan Surplus #1023", amount: 45000, date: "2026-06-25 19:30" },
    { id: 4, type: "in", category: "Penjualan POS", desc: "Penjualan POS #1022", amount: 210000, date: "2026-06-25 18:00" },
    { id: 5, type: "out", category: "Tagihan", desc: "Listrik & Air", amount: 300000, date: "2026-06-25 09:00" },
    { id: 6, type: "in", category: "Modal/Sponsor", desc: "Dana Suntikan Investor", amount: 5000000, date: "2026-06-24 08:00" },
    { id: 7, type: "out", category: "Lainnya", desc: "Biaya Kebersihan", amount: 50000, date: "2026-06-24 07:30" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add Transaction Modal State
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    date: new Date().toISOString().substring(0, 10),
    type: "in" as "in" | "out",
    category: "Modal/Sponsor",
    desc: "",
    amount: ""
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load language preference
  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage") as "en" | "id" | null;
    if (savedLang) {
      setLang(savedLang);
    } else {
      const systemLang = navigator.language.startsWith("id") ? "id" : "en";
      setLang(systemLang);
    }

    const handleLangChange = () => {
      const currentSaved = localStorage.getItem("preferredLanguage") as "en" | "id" | null;
      if (currentSaved) {
        setLang(currentSaved);
      }
    };
    window.addEventListener("languageChange", handleLangChange);
    return () => window.removeEventListener("languageChange", handleLangChange);
  }, []);

  const t = TRANSLATIONS[lang];

  // Initialize chat welcome message
  useEffect(() => {
    setMessages([
      { sender: "ai", text: t.chatWelcome }
    ]);
  }, [lang, t.chatWelcome]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = inputVal.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInputVal("");

    setTimeout(() => {
      let aiResponse = t.mockResponseDefault;
      const lower = userMsg.toLowerCase();
      if (lower.includes("roti") || lower.includes("bread") || lower.includes("sale") || lower.includes("surplus")) {
        aiResponse = t.mockResponse1;
      } else if (lower.includes("kadaluwarsa") || lower.includes("expired") || lower.includes("stok") || lower.includes("stock")) {
        aiResponse = t.mockResponse2;
      }
      setMessages(prev => [...prev, { sender: "ai", text: aiResponse }]);
    }, 800);
  };

  // Format dynamic date ranges
  const getRangeText = () => {
    if (timeFrame === "weekly") {
      const baseDate = new Date(2026, 5, 26);
      baseDate.setDate(baseDate.getDate() + dateOffset * 7);
      const endDate = new Date(baseDate);
      endDate.setDate(endDate.getDate() + 6);
      
      const format = (d: Date) => d.toLocaleDateString(lang === "en" ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" });
      return `${format(baseDate)} - ${format(endDate)}`;
    } else {
      const baseDate = new Date(2026, 5, 1);
      baseDate.setMonth(baseDate.getMonth() + dateOffset);
      return baseDate.toLocaleDateString(lang === "en" ? "en-US" : "id-ID", { month: "long", year: "numeric" });
    }
  };

  // Mock Data Generators for Sales Trend
  const getWeeklyData = () => {
    const defaultData = [420000, 380000, 480000, 520000, 680000, 850000, 780000];
    return defaultData.map(v => Math.max(100000, v + dateOffset * 35000));
  };
  const getMonthlyData = () => {
    const defaultData = [12500000, 14200000, 13800000, 15500000, 18200000, 19500000, 17800000, 19200000, 21000000, 20500000, 23000000, 24800000];
    return defaultData.map(v => Math.max(5000000, v + dateOffset * 1200000));
  };

  const salesData = {
    labels: timeFrame === "weekly"
      ? (lang === "en" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"])
      : (lang === "en" ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] : ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]),
    datasets: [
      {
        label: timeFrame === "weekly" ? t.salesTrendWeekly : t.salesTrendMonthly,
        data: timeFrame === "weekly" ? getWeeklyData() : getMonthlyData(),
        borderColor: "#005043",
        backgroundColor: "rgba(0, 80, 67, 0.06)",
        tension: 0.35,
        fill: true,
        pointBackgroundColor: "#005043",
        pointHoverRadius: 7,
      },
    ],
  };

  // Mock Data for Cashflow (Finance)
  const cashflowData = {
    labels: lang === "en" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    datasets: [
      {
        label: lang === "en" ? "Cash In" : "Kas Masuk",
        data: [500000, 450000, 600000, 550000, 800000, 950000, 850000],
        backgroundColor: "#10b981", // emerald-500
        borderRadius: 4,
      },
      {
        label: lang === "en" ? "Cash Out" : "Kas Keluar",
        data: [150000, 200000, 120000, 300000, 250000, 180000, 100000],
        backgroundColor: "#f43f5e", // rose-500
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
        ticks: { callback: (val: any) => "Rp " + (val / 1000) + "K" }
      }
    }
  };

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

  // Pagination Logic
  const filteredTransactions = transactions.filter(trx => {
    const matchesSearch = trx.desc.toLowerCase().includes(txSearch.toLowerCase()) || trx.category.toLowerCase().includes(txSearch.toLowerCase());
    const matchesFilter = txFilter === "all" || trx.type === txFilter;
    return matchesSearch && matchesFilter;
  });
  
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const currentTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [txSearch, txFilter]);

  // Rendering Tabs
  const renderFinanceTab = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Profit */}
        <Card className="border-slate-200/60 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Wallet className="w-16 h-16" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">{t.netProfit}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">Rp 3.450.000</div>
            <div className="flex items-center text-xs text-emerald-600 mt-1 font-semibold">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +12% dari minggu lalu
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="border-slate-200/60 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp className="w-16 h-16" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">{t.totalRevenue}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">Rp 4.700.000</div>
            <div className="flex items-center text-xs text-emerald-600 mt-1 font-semibold">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +8% dari minggu lalu
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="border-slate-200/60 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign className="w-16 h-16" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">{t.totalExpense}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">Rp 1.250.000</div>
            <div className="flex items-center text-xs text-rose-600 mt-1 font-semibold">
              <ArrowDownRight className="w-3 h-3 mr-1" /> -2% dari minggu lalu
            </div>
          </CardContent>
        </Card>

        {/* Surplus Recovery */}
        <Card className="border-slate-200/60 shadow-sm bg-emerald-50 overflow-hidden relative border-emerald-200">
          <div className="absolute top-0 right-0 p-4 opacity-10"><BadgeDollarSign className="w-16 h-16 text-emerald-600" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-emerald-800">{t.surplusRecovery}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700">Rp 320.000</div>
            <div className="text-xs text-emerald-600 mt-1">
              Dari 12.5 kg surplus terselamatkan
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Tables Section (Vertical) */}
      <div className="space-y-6">
        {/* Cashflow Chart (Full Width) */}
        <Card className="border-slate-200/60 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-resurva-dark" />
              {t.cashflowChart}
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
                {t.recentTransactions}
              </CardTitle>
              
              <div className="flex flex-col items-end gap-3 w-full lg:w-auto">
                <button 
                  onClick={() => setTxModalOpen(true)}
                  className="bg-resurva-dark hover:bg-resurva-dark-light text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer self-end"
                >
                  <Plus className="w-4 h-4" /> Tambah Transaksi
                </button>

                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center w-full lg:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Cari transaksi..." 
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
            
            {/* Pagination Controls */}
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
      </div>
    </div>
  );

  const renderSalesTab = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100/80 bg-slate-50/50 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-resurva-dark animate-spin-slow" />
              {timeFrame === "weekly" ? t.salesTrendWeekly : t.salesTrendMonthly}
            </CardTitle>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border min-w-[150px]">
                {timeFrame === "weekly" ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="month"
                      className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer text-center w-28"
                      value={(() => {
                        const baseDate = new Date(2026, 5, 26);
                        baseDate.setDate(baseDate.getDate() + dateOffset * 7);
                        const yyyy = baseDate.getFullYear();
                        const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
                        return `${yyyy}-${mm}`;
                      })()}
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const [newYear, newMonth] = e.target.value.split('-').map(Number);
                        const baseDate = new Date(2026, 5, 26);
                        baseDate.setDate(baseDate.getDate() + dateOffset * 7);
                        const currentWeekNum = Math.ceil(baseDate.getDate() / 7);
                        const targetWeek = Math.min(currentWeekNum, 4);
                        
                        const diffMonths = (newYear - 2026) * 12 + (newMonth - 6); // 6 is June
                        const newOffset = diffMonths * 4 + (targetWeek - 4);
                        setDateOffset(newOffset);
                      }}
                    />
                    <span className="text-slate-300">/</span>
                    <select
                      className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer appearance-none"
                      value={(() => {
                        const baseDate = new Date(2026, 5, 26);
                        baseDate.setDate(baseDate.getDate() + dateOffset * 7);
                        return Math.min(Math.ceil(baseDate.getDate() / 7), 4).toString();
                      })()}
                      onChange={(e) => {
                        const newWeek = parseInt(e.target.value);
                        const baseDate = new Date(2026, 5, 26);
                        baseDate.setDate(baseDate.getDate() + dateOffset * 7);
                        const currentWeekNum = Math.min(Math.ceil(baseDate.getDate() / 7), 4);
                        const weekDiff = newWeek - currentWeekNum;
                        setDateOffset(dateOffset + weekDiff);
                      }}
                    >
                      <option value="1">Mg 1</option>
                      <option value="2">Mg 2</option>
                      <option value="3">Mg 3</option>
                      <option value="4">Mg 4</option>
                    </select>
                  </div>
                ) : (
                  <input
                    type="month"
                    className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer w-full text-center"
                    value={(() => {
                      const baseDate = new Date(2026, 5, 1);
                      baseDate.setMonth(baseDate.getMonth() + dateOffset);
                      const yyyy = baseDate.getFullYear();
                      const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
                      return `${yyyy}-${mm}`;
                    })()}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const [newYear, newMonth] = e.target.value.split('-').map(Number);
                      const baseDate = new Date(2026, 5, 1);
                      const diffMonths = (newYear - baseDate.getFullYear()) * 12 + (newMonth - (baseDate.getMonth() + 1));
                      setDateOffset(diffMonths);
                    }}
                  />
                )}
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => { setTimeFrame("weekly"); setDateOffset(0); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timeFrame === "weekly" ? "bg-white text-resurva-dark shadow-xs" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.weekly}
                </button>
                <button
                  onClick={() => { setTimeFrame("monthly"); setDateOffset(0); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timeFrame === "monthly" ? "bg-white text-resurva-dark shadow-xs" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.monthly}
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[400px] w-full">
            <Line data={salesData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { callback: (value: any) => "Rp " + value.toLocaleString("id-ID") } } }
            }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200/60 shadow-sm relative overflow-hidden bg-gradient-to-br from-indigo-50/30 via-white to-white border-l-4 border-l-resurva-dark">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-resurva-dark" />
              {t.insight1Title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-sm leading-relaxed">{t.insight1Desc}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm relative overflow-hidden bg-gradient-to-br from-emerald-50/30 via-white to-white border-l-4 border-l-emerald-650">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-emerald-600" />
              {t.insight2Title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-sm leading-relaxed">{t.insight2Desc}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-8 min-h-screen relative bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-slate-500 text-sm mt-1">{t.description}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto no-scrollbar w-max">
        <button
          onClick={() => setActiveTab("finance")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "finance" ? "bg-resurva-dark text-white shadow-md" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Wallet className="w-4 h-4" /> {t.tabFinance}
        </button>
        <button
          onClick={() => setActiveTab("sales")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "sales" ? "bg-resurva-dark text-white shadow-md" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <PieChart className="w-4 h-4" /> {t.tabSales}
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="mt-6">
        {activeTab === "finance" && renderFinanceTab()}
        {activeTab === "sales" && renderSalesTab()}
      </div>

      {/* Add Transaction Modal */}
      {txModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setTxModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Tambah Transaksi</h3>
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
                        category: newType === "in" ? "Modal/Sponsor" : "Tagihan" 
                      });
                    }}
                  >
                    <option value="in" className="text-emerald-600">Uang Masuk (+)</option>
                    <option value="out" className="text-rose-600">Uang Keluar (-)</option>
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
                      <option value="Modal/Sponsor">Modal / Sponsor</option>
                      <option value="Penjualan POS">Penjualan POS</option>
                      <option value="Penjualan Lainnya">Penjualan Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option value="Tagihan">Tagihan Operasional (Listrik, Air)</option>
                      <option value="Bahan Baku">Pembelian Bahan Baku / Restock</option>
                      <option value="Gaji Karyawan">Gaji Karyawan</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Deskripsi / Catatan</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Beli telur 5kg"
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
                    placeholder="150000"
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
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
