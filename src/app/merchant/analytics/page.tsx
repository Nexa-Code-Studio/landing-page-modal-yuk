"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, MessageSquare, Send, X, ArrowLeft, Bot, RefreshCw } from "lucide-react";
import { useMerchantContext } from "@/lib/contexts/MerchantContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
    title: "Store Sales Analytics",
    description: "Analyze your store performance, revenue trend, and get AI business insights.",
    salesTrend: "Weekly Sales Trend (Rp)",
    aiInsightTitle: "AI Business Assistant Analysis",
    insight1Title: "Sales & Stock Optimization",
    insight1Desc: "Based on weekly trends, bakery items experience a 15% demand drop on Mondays. We recommend reducing the morning prep batch size for Chocolate Bread by 15% next Monday.",
    insight2Title: "Surplus Conversion Rate",
    insight2Desc: "Your surplus conversion is at 84%, which is excellent. You saved 12.5 kg of food waste this week, resulting in an additional Rp 320,000 in recovery revenue.",
    chatWelcome: "Hello! I am your AI Business Assistant. Ask me anything about your sales performance, inventory expiry tracking, or how to reduce food surplus waste.",
    chatInputPlaceholder: "Ask the AI assistant...",
    send: "Send",
    backBtn: "Back",
    chatTitle: "AI Business Assistant",
    mockResponse1: "Your Chocolate Bread surplus conversions are highest on Friday evenings between 5 PM and 8 PM. Setting a flash sale during these hours yields a 95% sell-out rate.",
    mockResponse2: "Currently, 2 products are nearing expiration within 24 hours. I suggest offering them as a 'Surplus Combo' via POS take-away to quickly clear stock.",
    mockResponseDefault: "Based on store data, your average daily profit is Rp 450,000. Makanan Berat (Heavy Meal) category contributes 48% of total revenue. Reducing surplus wastage could increase profit margin by up to 6.2%.",
  },
  id: {
    title: "Analitik Penjualan Toko",
    description: "Analisis performa toko Anda, tren pendapatan, dan dapatkan analisis bisnis berbasis AI.",
    salesTrend: "Tren Penjualan Mingguan (Rp)",
    aiInsightTitle: "Analisis AI Business Assistant",
    insight1Title: "Optimasi Penjualan & Ketersediaan Stok",
    insight1Desc: "Berdasarkan tren mingguan, produk bakery mengalami penurunan permintaan sebesar 15% pada hari Senin. Direkomendasikan untuk mengurangi volume produksi Roti Cokelat sebanyak 15% pada Senin depan.",
    insight2Title: "Tingkat Konversi Produk Surplus",
    insight2Desc: "Konversi surplus toko Anda berada di angka 84% (Sangat Baik). Anda menyelamatkan 12.5 kg makanan minggu ini, menghasilkan tambahan pemulihan pendapatan sebesar Rp 320.000.",
    chatWelcome: "Halo! Saya AI Business Assistant Anda. Tanyakan apa saja tentang kinerja penjualan, pemantauan tanggal kedaluwarsa, atau cara mengurangi limbah surplus makanan.",
    chatInputPlaceholder: "Tanya asisten AI...",
    send: "Kirim",
    backBtn: "Kembali",
    chatTitle: "AI Business Assistant",
    mockResponse1: "Penjualan Roti Cokelat surplus tertinggi terjadi pada Jumat malam pukul 17.00 - 20.00. Mengaktifkan Flash Sale pada jam tersebut meningkatkan tingkat kelarisan hingga 95%.",
    mockResponse2: "Saat ini ada 2 produk yang akan kedaluwarsa dalam 24 jam. Saya sarankan Anda membuat promo 'Paket Bundling Surplus' di POS untuk menghabiskan stok dengan cepat.",
    mockResponseDefault: "Berdasarkan data toko Anda, rata-rata laba harian Anda adalah Rp 450.000. Kategori Makanan Berat menyumbang 48% dari total pendapatan. Mengurangi surplus terbuang dapat menaikkan margin hingga 6,2%.",
  }
};

export default function StoreAnalyticsPage() {
  const { orders } = useMerchantContext();
  const [lang, setLang] = useState<"en" | "id">("en");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load language preference from localStorage
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
  }, [lang]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = inputVal.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInputVal("");

    // Simulate AI typing delay & intelligent mock response
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

  // Mock Sales Data
  const weeklySalesData = {
    labels: lang === "en" 
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] 
      : ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    datasets: [
      {
        label: t.salesTrend,
        data: [420000, 380000, 480000, 520000, 680000, 850000, 780000],
        borderColor: "rgba(79, 70, 229, 1)", // Indigo-600
        backgroundColor: "rgba(79, 70, 229, 0.08)",
        tension: 0.35,
        fill: true,
        pointBackgroundColor: "rgba(79, 70, 229, 1)",
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { 
        beginAtZero: true,
        ticks: {
          callback: (value: any) => "Rp " + value.toLocaleString("id-ID"),
        }
      },
    },
  };

  return (
    <div className="space-y-6 p-4 md:p-8 min-h-screen relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">{t.title}</h2>
          <p className="text-slate-500 text-sm">
            {t.description}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <Card className="border-slate-200/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100/80 bg-slate-50/50 pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin-slow" />
            {t.salesTrend}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-80 w-full">
            <Line data={weeklySalesData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200/60 shadow-sm relative overflow-hidden bg-gradient-to-br from-indigo-50/30 via-white to-white border-l-4 border-l-indigo-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              {t.insight1Title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t.insight1Desc}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm relative overflow-hidden bg-gradient-to-br from-emerald-50/30 via-white to-white border-l-4 border-l-emerald-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-emerald-600" />
              {t.insight2Title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t.insight2Desc}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-indigo-100"
        title={lang === "en" ? "Chat with AI Assistant" : "Chat dengan AI Assistant"}
      >
        <MessageSquare className="w-6 h-6 animate-pulse" />
      </button>

      {/* Slide-over / Modal Chat Overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsChatOpen(false)}
          />

          {/* Chat Panel Drawer */}
          <div className="relative w-full md:w-[420px] bg-white h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">{t.chatTitle}</h3>
                  <span className="text-[10px] text-indigo-200 mt-1 block">Online Assistant</span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)} 
                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-start gap-2.5`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-150/40 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                      AI
                    </div>
                  )}
                  <div className={`p-3.5 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                    msg.sender === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex gap-2 shrink-0">
              <input 
                type="text" 
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 focus:bg-white transition-all"
                placeholder={t.chatInputPlaceholder}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
