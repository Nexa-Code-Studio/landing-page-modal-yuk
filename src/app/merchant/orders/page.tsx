"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useMerchantContext, Order } from "@/lib/contexts/MerchantContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Store, 
  Printer, 
  CreditCard, 
  Banknote, 
  User, 
  AlertCircle, 
  NotepadText, 
  ChevronRight 
} from "lucide-react";

const TRANSLATIONS = {
  en: {
    title: "Order Management",
    description: "Manage online orders from marketplace and offline from POS.",
    searchPlaceholder: "Search ID / Customer Name...",
    tabNew: "New",
    tabOngoing: "Ongoing",
    tabCompleted: "Completed",
    noOrders: "No orders in this tab.",
    noOrdersSub: "Orders matching the filter will appear here.",
    detailTitle: "Order Detail",
    printBtn: "Print Receipt",
    timelineStep1: "Order Received",
    timelineStep2: "Prepared",
    timelineStep3: "Courier Arrived / Ready",
    timelineStep4: "Completed",
    timelineStep5: "Cancelled",
    notesTitle: "Customer Notes",
    customerLabel: "Customer",
    paymentLabel: "Payment Method",
    driverLabel: "Courier Information",
    itemsTitle: "Item Details",
    totalAmountLabel: "Grand Total",
    rejectBtn: "Reject Order",
    confirmBtn: "Confirm & Prepare",
    readyBtn: "Mark Order Ready",
    handoverBtn: "Handover to Courier/Customer",
    rejectModalTitle: "Reject Order",
    rejectModalText: "Select a reason to reject order",
    reasonStock: "Sold Out / Out of Stock",
    reasonClosed: "Store Closed / Busy",
    reasonProblem: "Item Problem",
    reasonOther: "Other",
    cancelBtn: "Cancel",
    confirmRejectBtn: "Confirm Reject",
    receiptTitle: "Receipt",
    dateLabel: "Order Date",
    orderNoLabel: "Order Number",
    notesLabel: "Notes",
    priceLabel: "Order Price",
    paidOnline: "Paid Online",
    cash: "Cash",
    itemsText: "Items",
    seeMore: "See more",
    specificNote: "Has Special Notes",
  },
  id: {
    title: "Manajemen Pesanan",
    description: "Kelola pesanan online dari marketplace dan offline dari POS.",
    searchPlaceholder: "Cari ID / Nama Pelanggan...",
    tabNew: "Baru",
    tabOngoing: "Berlangsung",
    tabCompleted: "Selesai",
    noOrders: "Tidak ada pesanan di tab ini.",
    noOrdersSub: "Pesanan yang sesuai dengan filter akan muncul di sini.",
    detailTitle: "Detail Pesanan",
    printBtn: "Cetak Resi",
    timelineStep1: "Pesanan Masuk",
    timelineStep2: "Disiapkan",
    timelineStep3: "Siap Diambil",
    timelineStep4: "Selesai",
    timelineStep5: "Dibatalkan",
    notesTitle: "Catatan Pelanggan",
    customerLabel: "Pelanggan",
    paymentLabel: "Metode Pembayaran",
    driverLabel: "Informasi Kurir",
    itemsTitle: "Rincian Item",
    totalAmountLabel: "Total Keseluruhan",
    rejectBtn: "Tolak Pesanan",
    confirmBtn: "Konfirmasi & Siapkan",
    readyBtn: "Tandai Pesanan Siap",
    handoverBtn: "Serahkan ke Kurir/Pelanggan",
    rejectModalTitle: "Tolak Pesanan",
    rejectModalText: "Pilih alasan penolakan pesanan",
    reasonStock: "Stok Habis / Sold Out",
    reasonClosed: "Toko Sedang Tutup / Sibuk",
    reasonProblem: "Item Bermasalah",
    reasonOther: "Lainnya",
    cancelBtn: "Batal",
    confirmRejectBtn: "Konfirmasi Tolak",
    receiptTitle: "Resi",
    dateLabel: "Waktu Pesan",
    orderNoLabel: "Nomor Pesanan",
    notesLabel: "Catatan",
    priceLabel: "Harga Pesanan",
    paidOnline: "Online Telah dibayar",
    cash: "Tunai",
    itemsText: "Item",
    seeMore: "Lihat Detail",
    specificNote: "Ada Catatan Khusus",
  }
};

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useMerchantContext();
  const [activeTab, setActiveTab] = useState<"Baru" | "Berlangsung" | "Selesai">("Baru");
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState<"en" | "id">("en");

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
  
  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [orderToReject, setOrderToReject] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Menunggu Konfirmasi": return "bg-orange-50 text-orange-600 border-orange-200";
      case "Disiapkan": return "bg-blue-50 text-blue-600 border-blue-200";
      case "Siap Diambil": return "bg-purple-50 text-purple-600 border-purple-200";
      case "Selesai": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "Dibatalkan": return "bg-red-50 text-red-600 border-red-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getOrderIcon = (type: string) => {
    if (type.includes("Delivery")) return <MapPin className="w-3.5 h-3.5" />;
    if (type.includes("Pickup")) return <Package className="w-3.5 h-3.5" />;
    return <Store className="w-3.5 h-3.5" />;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      let matchesTab = false;
      if (activeTab === "Baru") matchesTab = order.status === "Menunggu Konfirmasi";
      if (activeTab === "Berlangsung") matchesTab = ["Disiapkan", "Siap Diambil"].includes(order.status);
      if (activeTab === "Selesai") matchesTab = ["Selesai", "Dibatalkan"].includes(order.status);
      
      const matchesSearch = 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        
      return matchesTab && matchesSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, activeTab, searchQuery]);

  // Actions
  const handleConfirm = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    updateOrderStatus(id, "Disiapkan");
    if (selectedOrderModal?.id === id) {
      setSelectedOrderModal(prev => prev ? { ...prev, status: "Disiapkan" } : null);
    }
  };

  const handleMarkReady = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    updateOrderStatus(id, "Siap Diambil");
    if (selectedOrderModal?.id === id) {
      setSelectedOrderModal(prev => prev ? { ...prev, status: "Siap Diambil" } : null);
    }
  };

  const handleHandover = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    updateOrderStatus(id, "Selesai");
    if (selectedOrderModal?.id === id) {
      setSelectedOrderModal(prev => prev ? { ...prev, status: "Selesai" } : null);
    }
  };

  const handleRejectClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOrderToReject(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (orderToReject && rejectReason) {
      updateOrderStatus(orderToReject, "Dibatalkan");
      if (selectedOrderModal?.id === orderToReject) {
        setSelectedOrderModal(prev => prev ? { ...prev, status: "Dibatalkan" } : null);
      }
      setRejectModalOpen(false);
      setOrderToReject(null);
    }
  };

  const handlePrint = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.print();
  };

  // Komponen Resi Cetak (Struk Termal)
  const ThermalReceipt = ({ order }: { order: Order }) => {
    return (
      <div className="hidden print:block w-[80mm] max-w-[300px] mx-auto bg-white text-black font-sans p-4">
        {/* Header Logo */}
        <div className="text-center pb-2">
          <h2 className="text-xl font-extrabold flex justify-center items-center gap-1">
            <Store className="w-5 h-5 text-black" />
            Resurva
          </h2>
          <h3 className="font-bold text-lg mt-1">UMKM Berkah</h3>
        </div>

        {/* Order Number Box */}
        <div className="text-center font-bold text-xl border-y border-dashed border-black py-2 my-2">
          #{order.id.replace("ORD-", "")}
        </div>

        {/* Customer Info */}
        <div className="text-sm space-y-1 mb-3 font-mono">
          <div className="flex">
            <span className="w-32">{t.customerLabel}:</span>
            <span className="flex-1 font-semibold">{order.customerName}</span>
          </div>
          <div className="flex">
            <span className="w-32">{t.dateLabel}:</span>
            <span className="flex-1">{new Date(order.createdAt).toLocaleString("id-ID", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex">
            <span className="w-32">{t.orderNoLabel}:</span>
            <span className="flex-1">{order.id}</span>
          </div>
          {order.notes && (
            <div className="flex pt-1 mt-1 border-t border-dotted">
              <span className="w-32 font-bold">{t.notesLabel}:</span>
              <span className="flex-1 italic">"{order.notes}"</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-black pt-2 mb-2"></div>

        {/* Items */}
        <div className="text-sm space-y-3 mb-2 font-mono">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex justify-between items-start">
                <span className="font-semibold pr-2">{item.qty} x {item.name}</span>
              </div>
              {item.options && item.options.length > 0 && (
                <span className="text-[11px] text-gray-700 ml-4 italic">- {item.options.join(", ")}</span>
              )}
              {item.notes && (
                <span className="text-[11px] text-gray-700 ml-4 font-bold">NB: {item.notes}</span>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-black pt-2 mb-2"></div>

        {/* Totals */}
        <div className="text-sm space-y-1 font-mono">
          <div className="flex justify-between items-center font-bold">
            <span>{t.priceLabel}</span>
            <span>Rp {order.totalAmount.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-start pt-2">
            <span>{t.paymentLabel}</span>
            <span className="text-right w-1/2 break-words">
              {order.paymentMethod?.includes("Online") || order.paymentMethod?.includes("QRIS") 
                ? t.paidOnline 
                : t.cash}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!selectedOrderModal) return null;
    const order = selectedOrderModal;
    const isOnlineDelivery = order.orderType === "Online Delivery";
    const showDriver = isOnlineDelivery && ["Disiapkan", "Siap Diambil", "Selesai"].includes(order.status);
    const canPrint = !["Menunggu Konfirmasi", "Dibatalkan"].includes(order.status);

    const steps = [
      { label: t.timelineStep1, active: true },
      { label: t.timelineStep2, active: ["Disiapkan", "Siap Diambil", "Selesai"].includes(order.status) },
      { label: isOnlineDelivery ? (lang === "en" ? "Courier Heading to Location" : "Kurir Menuju Lokasi") : t.timelineStep3, active: ["Siap Diambil", "Selesai"].includes(order.status) },
      { label: t.timelineStep4, active: order.status === "Selesai" },
    ];

    if (order.status === "Dibatalkan") {
      steps.forEach(s => s.active = false);
      steps[0].active = true;
      steps.push({ label: t.timelineStep5, active: true });
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:bg-white print:p-0 animate-fade-in">
        
        {/* Web Modal UI (Hidden on Print) */}
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:hidden">
          {/* Header */}
          <div className="p-4 border-b bg-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                {t.detailTitle} {order.id}
                <Badge variant="outline" className={`ml-2 bg-white ${order.orderType.includes('Delivery') ? 'border-blue-200 text-blue-700' : 'border-emerald-200 text-emerald-700'}`}>
                  {order.orderType}
                </Badge>
              </h3>
              <p className="text-sm text-slate-500 mt-1">{new Date(order.createdAt).toLocaleString("id-ID")}</p>
            </div>
            <div className="flex gap-2 items-start">
              {canPrint && (
                <Button variant="outline" size="sm" onClick={handlePrint} className="text-slate-600 border-slate-200 rounded-xl font-bold">
                  <Printer className="w-4 h-4 mr-2" /> {t.printBtn}
                </Button>
              )}
              <button onClick={() => setSelectedOrderModal(null)} className="text-slate-400 hover:text-slate-600 px-2 font-bold p-1 bg-slate-100 rounded-lg hover:bg-slate-200">✕</button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Stepper Timeline */}
            <div className="bg-slate-50/80 rounded-xl p-6 border border-slate-100">
              <div className="flex justify-between relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2"></div>
                {order.status !== "Dibatalkan" && <div className="absolute top-1/2 left-0 h-1 bg-resurva-dark -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: `${(steps.filter(s => s.active).length - 1) / (steps.length - 1) * 100}%` }}></div>}
                
                {steps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      step.active 
                        ? (step.label === t.timelineStep5 ? "bg-red-500 text-white" : "bg-resurva-dark text-white ring-4 ring-resurva-green-muted") 
                        : "bg-slate-200 text-slate-400"
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-[10px] font-medium text-center w-20 ${step.active ? (step.label === t.timelineStep5 ? "text-red-600" : "text-resurva-dark") : "text-slate-400"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Note Alert */}
            {order.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800">{t.notesTitle}</h4>
                  <p className="text-sm text-amber-700 mt-1 italic">"{order.notes}"</p>
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">{t.customerLabel}</p>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" /> {order.customerName}
                </p>
              </div>
              <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">{t.paymentLabel}</p>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  {order.paymentMethod?.includes("QRIS") || order.paymentMethod?.includes("Online") ? <CreditCard className="w-4 h-4 text-slate-400" /> : <Banknote className="w-4 h-4 text-slate-400" />}
                  {order.paymentMethod || t.cash}
                </p>
              </div>
            </div>

            {/* Driver Info */}
            {showDriver && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-bold uppercase mb-1">{t.driverLabel}</p>
                  <p className="font-semibold text-slate-900">{order.driverInfo?.name || "Budi Driver (Simulasi)"}</p>
                  <p className="text-sm text-slate-600">{order.driverInfo?.licensePlate || "N 1234 AB"}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                   <MapPin className="w-5 h-5" />
                </div>
              </div>
            )}

            {/* Item List */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t.itemsTitle}</h4>
                <Badge className={`${getStatusColor(order.status)}`} variant="secondary">
                  Status: {order.status}
                </Badge>
              </div>
              
              <ul className="space-y-3 bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <li key={idx} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-start text-sm">
                      <div className="flex gap-3">
                        <span className="font-bold text-resurva-dark bg-resurva-green-muted/30 px-2 py-0.5 rounded-md h-fit">{item.qty}x</span>
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800">{item.name}</span>
                          
                          {/* Options */}
                          {item.options && item.options.length > 0 && (
                            <div className="text-xs text-slate-500 font-medium">
                              {item.options.map((opt, i) => (
                                <span key={i} className="inline-block bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 mr-1 mb-1">
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Item specific notes */}
                          {item.notes && (
                            <div className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
                              <NotepadText className="w-3 h-3" />
                              Note: "{item.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
                
                {/* Total Row */}
                <li className="p-4 bg-slate-50">
                  <div className="flex justify-between items-center border-slate-200">
                    <span className="font-bold text-slate-900 text-sm">{t.totalAmountLabel}</span>
                    <span className="font-extrabold text-resurva-dark text-xl">Rp {order.totalAmount.toLocaleString("id-ID")}</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>

          {/* Action Footer */}
          <div className="p-4 border-t bg-white flex justify-end gap-3">
            {order.status === "Menunggu Konfirmasi" && (
              <div className="flex w-full gap-3">
                <Button variant="outline" className="w-1/2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-xl" onClick={(e) => handleRejectClick(e, order.id)}>
                  {t.rejectBtn}
                </Button>
                <Button className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl" onClick={(e) => handleConfirm(e, order.id)}>
                  {t.confirmBtn}
                </Button>
              </div>
            )}
            
            {order.status === "Disiapkan" && (
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl" onClick={(e) => handleMarkReady(e, order.id)}>
                <CheckCircle className="w-4 h-4 mr-2" /> {t.readyBtn}
              </Button>
            )}
            
            {order.status === "Siap Diambil" && (
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl" onClick={(e) => handleHandover(e, order.id)}>
                {t.handoverBtn}
              </Button>
            )}
          </div>
        </div>
        
        {/* Thermal Receipt UI (Hidden on Screen, Shows on Print) */}
        {canPrint && <ThermalReceipt order={order} />}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-8 print:p-0 print:m-0 print:bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">{t.title}</h2>
          <p className="text-slate-500 text-sm">
            {t.description}
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          <Input 
            placeholder={t.searchPlaceholder} 
            className="pl-10 border-slate-200 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 print:hidden overflow-x-auto hide-scrollbar">
        {([t.tabNew, t.tabOngoing, t.tabCompleted] as const).map(tab => {
          let count = 0;
          let activeTabKey: "Baru" | "Berlangsung" | "Selesai" = "Baru";
          if (tab === t.tabNew) {
            count = orders.filter(o => o.status === "Menunggu Konfirmasi").length;
            activeTabKey = "Baru";
          } else if (tab === t.tabOngoing) {
            count = orders.filter(o => ["Disiapkan", "Siap Diambil"].includes(o.status)).length;
            activeTabKey = "Berlangsung";
          } else {
            activeTabKey = "Selesai";
          }
          
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(activeTabKey)}
              className={`px-6 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === activeTabKey 
                  ? "border-resurva-dark text-resurva-dark" 
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === activeTabKey ? "bg-resurva-dark text-white" : "bg-slate-200 text-slate-600"}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Grid Order List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 print:hidden">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500 border-2 border-dashed rounded-xl bg-slate-50/50">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-lg">{t.noOrders}</p>
            <p className="text-sm mt-1">{t.noOrdersSub}</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const canPrint = !["Menunggu Konfirmasi", "Dibatalkan"].includes(order.status);
            const totalItemsCount = order.items.reduce((acc, item) => acc + item.qty, 0);
            const hasNotes = order.notes || order.items.some(i => i.notes);
            
            return (
              <Card 
                key={order.id} 
                className="overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-resurva-dark/40 transition-all cursor-pointer rounded-xl flex flex-col h-full"
                onClick={() => setSelectedOrderModal(order)}
              >
                {/* Header Compact */}
                <div className="p-4 pb-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xs font-bold text-slate-500 shrink-0">{order.id}</span>
                    <Badge variant="outline" className={`shrink-0 flex items-center gap-1 bg-white ${order.orderType.includes('Delivery') ? 'border-blue-200 text-blue-700' : 'border-emerald-200 text-emerald-700'} px-1.5 py-0`}>
                      {getOrderIcon(order.orderType)}
                    </Badge>
                  </div>
                  
                  {/* Status Badge atau Print Icon */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge className={`text-[10px] px-1.5 py-0 ${getStatusColor(order.status)}`} variant="secondary">
                      {order.status}
                    </Badge>
                    {canPrint && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedOrderModal(order); setTimeout(handlePrint, 100); }} 
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
                        title={t.printBtn}
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Body Info */}
                <div className="p-4 flex-1 flex flex-col gap-3 pointer-events-none">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 leading-tight truncate" title={order.customerName}>
                      {order.customerName}
                    </h3>
                    <div className="flex items-center text-[11px] text-slate-500 font-medium mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(order.createdAt).toLocaleString("id-ID", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Total</p>
                      <div className="font-extrabold text-resurva-dark text-xl leading-none">
                        Rp {order.totalAmount.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>

                  {/* Catatan Warning Label */}
                  {hasNotes && (
                    <div className="mt-1 flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded border border-amber-200 w-fit">
                      <AlertCircle className="w-3 h-3" /> {t.specificNote}
                    </div>
                  )}
                  
                  {/* Item Summary (Compact Box) */}
                  <div className="mt-auto pt-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Daftar Item</p>
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700">Total {totalItemsCount} {t.itemsText}</span>
                      <span className="text-xs text-blue-600 font-medium flex items-center">{t.seeMore} <ChevronRight className="w-3 h-3 ml-0.5" /></span>
                    </div>
                  </div>
                </div>
                
                {/* Footer Actions (Full width) */}
                {activeTab !== "Selesai" && (
                  <div className="p-3 border-t border-slate-100 bg-white">
                    {order.status === "Menunggu Konfirmasi" && (
                      <div className="flex gap-2 w-full">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-1/2 text-red-600 border-red-200 hover:bg-red-50 text-xs px-0 rounded-xl" 
                          onClick={(e) => handleRejectClick(e, order.id)}
                        >
                          {t.rejectBtn.split(" ")[0]}
                        </Button>
                        <Button 
                          size="sm"
                          className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-0 rounded-xl" 
                          onClick={(e) => handleConfirm(e, order.id)}
                        >
                          {t.confirmBtn.split(" ")[0]}
                        </Button>
                      </div>
                    )}
                    
                    {order.status === "Disiapkan" && (
                      <Button 
                        size="sm"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-xl" 
                        onClick={(e) => handleMarkReady(e, order.id)}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> {t.readyBtn}
                      </Button>
                    )}
                    
                    {order.status === "Siap Diambil" && (
                      <Button 
                        size="sm"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl" 
                        onClick={(e) => handleHandover(e, order.id)}
                      >
                        {t.handoverBtn}
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-red-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-red-800 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> {t.rejectModalTitle}
              </h3>
              <button onClick={() => setRejectModalOpen(false)} className="text-red-400 hover:text-red-600">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                {t.rejectModalText} <strong>{orderToReject}</strong>.
              </p>
              
              <div className="space-y-2">
                {[
                  { key: t.reasonStock, value: "Stok Habis / Sold Out" },
                  { key: t.reasonClosed, value: "Toko Sedang Tutup / Sibuk" },
                  { key: t.reasonProblem, value: "Item Bermasalah" },
                  { key: t.reasonOther, value: "Lainnya" }
                ].map(item => (
                  <label key={item.value} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="radio" 
                      name="rejectReason" 
                      value={item.value}
                      checked={rejectReason === item.value}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-sm font-semibold text-slate-800">{item.key}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" className="rounded-xl" onClick={() => setRejectModalOpen(false)}>{t.cancelBtn}</Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl" 
                onClick={confirmReject}
                disabled={!rejectReason}
              >
                {t.confirmRejectBtn}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {renderDetailModal()}
    </div>
  );
}
