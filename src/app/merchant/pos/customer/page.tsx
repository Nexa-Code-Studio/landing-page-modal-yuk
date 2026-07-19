"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, QrCode, CheckCircle2, Banknote, MapPin, Store, Smile } from "lucide-react";

interface VariantOption {
  id: string;
  name: string;
  additionalPrice: number;
}

interface CartItem {
  id: string;
  product: { id: string; name: string; imageUrl?: string };
  quantity: number;
  selectedVariants: Record<string, VariantOption[]>;
  unitPrice: number;
  totalPrice: number;
}

export default function CustomerDisplayPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Tunai" | "QRIS">("Tunai");
  const [cashReceived, setCashReceived] = useState(0);
  const [change, setChange] = useState(0);
  const [orderType, setOrderType] = useState("Dine-In");

  useEffect(() => {
    // Setup BroadcastChannel Listener
    const bc = new BroadcastChannel("pos-customer-sync");
    
    bc.onmessage = (event) => {
      const data = event.data;
      if (data) {
        if (data.cartItems !== undefined) setCartItems(data.cartItems);
        if (data.subtotal !== undefined) setSubtotal(data.subtotal);
        if (data.tax !== undefined) setTax(data.tax);
        if (data.grandTotal !== undefined) setGrandTotal(data.grandTotal);
        if (data.paymentModalOpen !== undefined) setPaymentModalOpen(data.paymentModalOpen);
        if (data.receiptModalOpen !== undefined) setReceiptModalOpen(data.receiptModalOpen);
        if (data.paymentMethod !== undefined) setPaymentMethod(data.paymentMethod);
        if (data.cashReceived !== undefined) setCashReceived(data.cashReceived);
        if (data.change !== undefined) setChange(data.change);
        if (data.orderType !== undefined) setOrderType(data.orderType);
      }
    };

    return () => {
      bc.close();
    };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 flex flex-col lg:flex-row p-4 sm:p-6 gap-4 sm:gap-6 select-none font-sans text-slate-900">
      {/* Left: Cart Items Panel */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full min-h-0 overflow-hidden">
        {/* Header */}
        <div className="bg-resurva-dark p-5 sm:p-6 text-white flex justify-between items-center shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
            <ShoppingCart className="text-resurva-gold" /> Daftar Pesanan Anda
          </h2>
          <div className="bg-white/10 text-resurva-gold border border-resurva-gold/30 px-4 py-1.5 rounded-full text-sm font-semibold">
            {orderType}
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          {cartItems.length === 0 ? (
            /* Empty State: Rotating dashed ring with Smile icon */
            <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 animate-fade-in">
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-resurva-dark/40 animate-[spin_10s_linear_infinite]" />
                <Smile className="w-16 h-16 text-resurva-dark stroke-[2.2]" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Selamat Datang!</h3>
              <p className="text-slate-500 text-base sm:text-lg mt-2 max-w-md leading-relaxed">
                Silakan sampaikan pesanan Anda kepada kasir kami.
              </p>
            </div>
          ) : (
            /* Item List */
            <div className="space-y-3.5">
              {cartItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex justify-between items-center p-4 sm:p-5 border border-slate-100 rounded-2xl bg-slate-50 hover:border-slate-200 transition-all animate-fade-in shadow-xs"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Left: Product Image Thumbnail */}
                  <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-200 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center shadow-inner">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-7 h-7 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight truncate">{item.product.name}</h3>
                      {Object.values(item.selectedVariants).flat().map((v, i) => (
                        <p key={i} className="text-xs sm:text-sm text-slate-500 truncate">+ {v.name}</p>
                      ))}
                    </div>
                  </div>

                  {/* Right: Unit Price (Top) & Quantity (Bottom) */}
                  <div className="text-right shrink-0 pl-4 flex flex-col items-end gap-1">
                    <p className="text-lg sm:text-2xl font-black text-resurva-dark">
                      Rp {item.unitPrice.toLocaleString("id-ID")}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-slate-700 bg-slate-200/80 border border-slate-300/60 px-3 py-1 rounded-lg">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Ringkasan Tagihan (Nota Paper Style) */}
      <div className="w-full lg:w-[420px] bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col p-6 sm:p-8 shrink-0 h-full min-h-0 relative">
        {/* Nota Header */}
        <div className="text-center pb-4 border-b-2 border-dashed border-slate-200 shrink-0">
          <div className="w-10 h-10 bg-resurva-dark text-resurva-gold rounded-full flex items-center justify-center mx-auto mb-2 font-black text-sm shadow-md">
            UB
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">UMKM Berkah</h2>
          <p className="text-xs text-slate-400 mt-0.5">Cabang Malang • Nota Pelanggan</p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            <span>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
            <span>•</span>
            <span>{orderType}</span>
          </div>
        </div>

        {/* Nota Items List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2 min-h-0 text-xs font-mono text-slate-600 no-scrollbar">
          {cartItems.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 italic py-8">
              Belum ada item pesanan
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start py-0.5">
                <span className="flex-1 truncate pr-2">{item.quantity}x {item.product.name}</span>
                <span className="font-semibold text-slate-800">Rp {item.totalPrice.toLocaleString("id-ID")}</span>
              </div>
            ))
          )}
        </div>

        {/* Financial Breakdown */}
        <div className="pt-4 border-t-2 border-dashed border-slate-200 shrink-0 space-y-2">
          <div className="flex justify-between text-xs sm:text-sm text-slate-500 font-mono">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-slate-500 font-mono">
            <span>Pajak Resto (11%)</span>
            <span>Rp {tax.toLocaleString("id-ID")}</span>
          </div>
          
          <div className="border-t-2 border-slate-900 pt-3 mt-3 flex justify-between items-baseline">
            <span className="text-base font-extrabold text-slate-900">TOTAL</span>
            <span className="text-2xl sm:text-3xl font-black text-resurva-dark">
              Rp {grandTotal.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Paying QRIS details */}
          {paymentModalOpen && paymentMethod === "QRIS" && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-3 text-center animate-fade-in">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Scan QRIS untuk Membayar</p>
              <div className="bg-white p-3 rounded-xl border border-blue-100 inline-block shadow-sm">
                <QrCode className="w-32 h-32 text-slate-800" />
              </div>
            </div>
          )}

          {/* Paying Cash details */}
          {paymentModalOpen && paymentMethod === "Tunai" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mt-3 space-y-1 text-xs font-semibold text-emerald-800 animate-fade-in">
              <div className="flex justify-between">
                <span>Uang Diterima:</span>
                <span>Rp {cashReceived.toLocaleString("id-ID")}</span>
              </div>
              {cashReceived >= grandTotal && (
                <div className="flex justify-between text-emerald-900 font-extrabold text-sm pt-1 border-t border-emerald-200">
                  <span>Kembalian:</span>
                  <span>Rp {change.toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>
          )}

          {/* Success Receipt highlight */}
          {receiptModalOpen && (
            <div className="bg-emerald-600 text-white rounded-2xl p-3.5 mt-3 text-center animate-fade-in shadow-md">
              <CheckCircle2 className="w-7 h-7 mx-auto mb-1 text-emerald-100" />
              <p className="font-extrabold text-sm">Pembayaran Berhasil!</p>
              <p className="text-[11px] opacity-90">Terima kasih atas kunjungan Anda</p>
            </div>
          )}

          {!paymentModalOpen && !receiptModalOpen && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-500 text-center text-xs mt-3">
              Mohon periksa kembali pesanan Anda sebelum melakukan pembayaran.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
