"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, QrCode, CheckCircle2, Banknote, MapPin } from "lucide-react";

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
  const [lang, setLang] = useState<"en" | "id">("id");

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

  // Determine which screen to show
  const isIdle = cartItems.length === 0 && !paymentModalOpen && !receiptModalOpen;
  const isOrdering = cartItems.length > 0 && !paymentModalOpen && !receiptModalOpen;
  const isPaying = paymentModalOpen && !receiptModalOpen;
  const isReceipt = receiptModalOpen;

  if (isIdle) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-resurva-dark flex flex-col items-center justify-center p-8 relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #EDD099 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
        
        <div className="z-10 bg-white/10 backdrop-blur-md border border-white/20 p-12 rounded-[3rem] flex flex-col items-center max-w-4xl w-full text-center shadow-2xl animate-fade-in">
          <div className="w-24 h-24 bg-[#EDD099] rounded-full flex items-center justify-center mb-8 shadow-lg">
            <span className="text-resurva-dark font-black text-4xl">UB</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight">UMKM Berkah</h1>
          <p className="text-2xl text-[#EDD099] font-medium max-w-2xl leading-relaxed">
            Selamat Datang! Silakan sampaikan pesanan Anda kepada kasir kami.
          </p>
          <div className="mt-12 flex gap-4 text-white/50 text-sm font-semibold uppercase tracking-widest">
            <MapPin className="w-5 h-5" />
            <span>Cabang Malang</span>
          </div>
        </div>
      </div>
    );
  }

  if (isReceipt) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-green-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-12 rounded-[3rem] flex flex-col items-center max-w-2xl w-full text-center shadow-2xl animate-fade-in border border-green-100">
          <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-8">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">Pembayaran Berhasil!</h1>
          <p className="text-xl text-slate-500 mb-8">Terima kasih atas kunjungan Anda di UMKM Berkah.</p>
          
          <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div className="flex justify-between items-center text-lg mb-2 text-slate-600">
              <span>Total Tagihan</span>
              <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
            </div>
            {paymentMethod === "Tunai" && (
              <div className="flex justify-between items-center text-lg font-bold text-green-700 mt-4 pt-4 border-t border-slate-200">
                <span>Kembalian</span>
                <span>Rp {change.toLocaleString("id-ID")}</span>
              </div>
            )}
            {paymentMethod === "QRIS" && (
              <div className="flex justify-between items-center text-lg font-bold text-blue-700 mt-4 pt-4 border-t border-slate-200">
                <span>Metode</span>
                <span>QRIS Xendit</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isPaying) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-slate-50 flex p-6 gap-6">
        {/* Left Side: Order Summary */}
        <div className="w-1/3 bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col min-h-0">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3 shrink-0">
            <ShoppingCart className="text-resurva-dark" /> Ringkasan Pesanan
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-start text-lg">
                <div className="flex-1 pr-4">
                  <p className="font-semibold text-slate-800">{item.quantity}x {item.product.name}</p>
                  {Object.values(item.selectedVariants).flat().map((v, i) => (
                    <p key={i} className="text-sm text-slate-500">+ {v.name}</p>
                  ))}
                </div>
                <p className="font-bold text-slate-700">{(item.totalPrice).toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-dashed border-slate-200 pt-6 mt-6 shrink-0">
            <div className="flex justify-between items-center text-slate-500 mb-2">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 mb-4">
              <span>Pajak (11%)</span>
              <span>Rp {tax.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center text-3xl font-black text-slate-900 bg-slate-100 p-4 rounded-xl">
              <span>TOTAL</span>
              <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Details */}
        <div className="flex-1 bg-white rounded-3xl p-12 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center animate-fade-in min-h-0 overflow-y-auto">
          {paymentMethod === "QRIS" ? (
            <>
              <div className="bg-blue-50 text-blue-700 px-6 py-2 rounded-full font-bold mb-10 text-xl border border-blue-200">
                Scan QRIS untuk Membayar
              </div>
              <div className="bg-white p-6 rounded-3xl border-4 border-slate-100 shadow-xl mb-10">
                <QrCode className="w-64 h-64 text-slate-800" />
              </div>
              <p className="text-2xl text-slate-600 mb-2">Total Pembayaran</p>
              <p className="text-6xl font-black text-slate-900">Rp {grandTotal.toLocaleString("id-ID")}</p>
            </>
          ) : (
            <>
              <div className="bg-green-50 text-green-700 px-6 py-2 rounded-full font-bold mb-12 text-xl border border-green-200 flex items-center gap-2">
                <Banknote /> Pembayaran Tunai
              </div>
              
              <div className="w-full max-w-md space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl flex justify-between items-center">
                  <span className="text-xl text-slate-500">Total Tagihan</span>
                  <span className="text-3xl font-bold text-slate-900">Rp {grandTotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl flex justify-between items-center">
                  <span className="text-xl text-slate-500">Uang Diterima</span>
                  <span className="text-3xl font-bold text-slate-900">Rp {cashReceived.toLocaleString("id-ID")}</span>
                </div>
                
                {cashReceived >= grandTotal && (
                  <div className="bg-resurva-dark text-white p-6 rounded-2xl flex justify-between items-center mt-8 shadow-lg">
                    <span className="text-2xl font-medium">Kembalian</span>
                    <span className="text-4xl font-black">Rp {change.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // isOrdering
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 flex p-6 gap-6">
      {/* Left: Cart Items List */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col min-h-0 overflow-hidden">
        <div className="bg-resurva-dark p-6 text-white flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <ShoppingCart /> Daftar Pesanan Anda
          </h2>
          <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
            {orderType}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.map((item, index) => (
            <div key={item.id} className="flex justify-between items-center p-6 border border-slate-100 rounded-2xl bg-slate-50 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-xl text-resurva-dark border border-slate-200 shadow-sm">
                  {item.quantity}x
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{item.product.name}</h3>
                  {Object.values(item.selectedVariants).flat().map((v, i) => (
                    <p key={i} className="text-slate-500">+ {v.name}</p>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900">Rp {item.totalPrice.toLocaleString("id-ID")}</p>
                {item.quantity > 1 && (
                  <p className="text-sm text-slate-500">@ Rp {item.unitPrice.toLocaleString("id-ID")}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Total Summary */}
      <div className="w-[400px] bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col p-8">
        <h2 className="text-xl font-bold text-slate-500 mb-8 uppercase tracking-widest text-center">Ringkasan</h2>
        
        <div className="flex-1 flex flex-col justify-end space-y-6">
          <div className="space-y-4 text-xl">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Pajak (11%)</span>
              <span>Rp {tax.toLocaleString("id-ID")}</span>
            </div>
          </div>
          
          <div className="border-t-4 border-dashed border-slate-200 pt-6">
            <p className="text-slate-500 text-lg mb-2">Total Tagihan</p>
            <p className="text-5xl font-black text-resurva-dark break-words">
              Rp {grandTotal.toLocaleString("id-ID")}
            </p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-center text-sm font-medium mt-8">
            Mohon periksa kembali pesanan Anda sebelum melakukan pembayaran.
          </div>
        </div>
      </div>
    </div>
  );
}
