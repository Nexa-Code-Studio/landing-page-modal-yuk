"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useMerchantContext, Product, VariantGroup, VariantOption } from "@/lib/contexts/MerchantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Minus, Plus, Trash2, Receipt, Banknote, QrCode, Tag, AlertTriangle } from "lucide-react";

interface CartItem {
  id: string; // Unique ID for cart entry (differentiates same product with different variants)
  product: Product;
  quantity: number;
  selectedVariants: Record<string, VariantOption[]>; // groupId -> selected options
  unitPrice: number; // Base price + variants
  totalPrice: number; // unitPrice * qty
}

type OrderType = "Dine-In" | "Take-Away";

const TRANSLATIONS = {
  en: {
    searchPlaceholder: "Search menu...",
    all: "All",
    cartTitle: "Orders",
    clearBtn: "Clear",
    dineIn: "Dine-In",
    takeAway: "Take-Away",
    emptyCart: "No orders yet",
    subtotal: "Subtotal",
    tax: "Restaurant Tax (11%)",
    total: "TOTAL",
    payBtn: "Pay Order",
    cash: "Cash",
    qris: "QRIS (Xendit)",
    totalBill: "Total Bill",
    cashReceivedLabel: "Cash Received (Rp)",
    exactChange: "Exact Change",
    change: "Change",
    processPayment: "Process Payment",
    availableVariant: "Variant Available",
    receiptTitle: "Receipt",
    printBtn: "Print Receipt",
    doneBtn: "Done",
    thanks: "Thank you for your visit!",
    confirmAdd: "Confirm & Add",
    required: "Required",
    optional: "Optional",
    selectVariant: "Select Variant",
    paymentTitle: "Payment",
    underpaid: "Cash received is less than the total bill.",
    showQris: "Show QRIS Xendit on Customer Screen",
    qrisSim: "Simulation: Assume customer has scanned and paid.",
    outletMalang: "Malang Branch",
    outletAddr: "Jl. Example No 123",
  },
  id: {
    searchPlaceholder: "Cari menu...",
    all: "Semua",
    cartTitle: "Pesanan",
    clearBtn: "Kosongkan",
    dineIn: "Makan di Tempat",
    takeAway: "Bungkus",
    emptyCart: "Belum ada pesanan",
    subtotal: "Subtotal",
    tax: "Pajak Resto (11%)",
    total: "TOTAL",
    payBtn: "Bayar Pesanan",
    cash: "Tunai",
    qris: "QRIS (Xendit)",
    totalBill: "Total Tagihan",
    cashReceivedLabel: "Uang Diterima (Rp)",
    exactChange: "Uang Pas",
    change: "Kembalian",
    processPayment: "Proses Pembayaran",
    availableVariant: "Tersedia Varian",
    receiptTitle: "Struk Pembayaran",
    printBtn: "Cetak Struk",
    doneBtn: "Selesai",
    thanks: "Terima kasih atas kunjungannya!",
    confirmAdd: "Konfirmasi & Tambah",
    required: "Wajib",
    optional: "Opsional",
    selectVariant: "Pilih Varian",
    paymentTitle: "Pembayaran",
    underpaid: "Uang yang diterima kurang dari total pembayaran.",
    showQris: "Tampilkan QRIS Xendit di Layar Pelanggan",
    qrisSim: "Simulasi: Anggap pelanggan sudah *scan* dan bayar via E-Wallet/M-Banking.",
    outletMalang: "Cabang Malang",
    outletAddr: "Jl. Contoh No 123",
  }
};

import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function POSPage() {
  const { products, batches, addOrder } = useMerchantContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeTypeFilter, setActiveTypeFilter] = useState<"Semua" | "Surplus" | "Reguler">("Semua");
  const [orderType, setOrderType] = useState<OrderType>("Dine-In");
  const { lang } = useLanguage();


  // Warning Modal State
  const [warningModal, setWarningModal] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: "", message: "" });

  const showWarning = (message: string, title?: string) => {
    setWarningModal({
      open: true,
      title: title || (lang === "en" ? "Stock Warning" : "Peringatan Stok"),
      message
    });
  };

  const getActiveBatch = (product: Product) => {
    const now = Date.now();
    const prodBatches = product.batches || batches.filter(b => b.productId === product.id);
    const active = prodBatches.filter(b => b.remainingQty > 0 && (!b.expiryDate || new Date(b.expiryDate).getTime() > now));
    active.sort((a, b) => {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });
    return active[0];
  };

  const getAvailableStock = (product: Product) => {
    const now = Date.now();
    const prodBatches = product.batches || batches.filter(b => b.productId === product.id);
    if (prodBatches.length > 0) {
      // If product has inventory batches, strictly sum remainingQty of active non-expired batches
      const active = prodBatches.filter(b => b.remainingQty > 0 && (!b.expiryDate || new Date(b.expiryDate).getTime() > now));
      return active.reduce((sum, b) => sum + b.remainingQty, 0);
    }
    // Fallback to product.quantity ONLY if no inventory batches exist at all
    return product.quantity || 0;
  };



  const t = TRANSLATIONS[lang];
  
  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Modals State
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tempVariantSelections, setTempVariantSelections] = useState<Record<string, VariantOption[]>>({});
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Tunai" | "QRIS">("Tunai");
  const [cashReceived, setCashReceived] = useState<number>(0);
  
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Broadcast Channel for Customer Facing Display
  const bcRef = React.useRef<BroadcastChannel | null>(null);
  
  useEffect(() => {
    bcRef.current = new BroadcastChannel("pos-customer-sync");
    return () => {
      bcRef.current?.close();
    };
  }, []);


  const openCustomerDisplay = () => {
    window.open("/merchant/pos/customer", "customer_display", "width=1024,height=768");
  };

  // Derived state
  const categories = [lang === "en" ? "All" : "Semua", ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const isAllText = activeCategory === "Semua" || activeCategory === "All";
      const matchesCategory = isAllText || p.category === activeCategory;
      
      const nowTime = Date.now();
      const activeBatches = p.batches?.filter(b => !b.expiryDate || new Date(b.expiryDate).getTime() > nowTime) || [];
      
      let matchesType = true;
      if (activeTypeFilter === "Surplus") {
        matchesType = activeBatches.some(b => b.menuType === "Surplus");
      } else if (activeTypeFilter === "Reguler") {
        matchesType = activeBatches.some(b => b.menuType === "Reguler");
      }

      return matchesSearch && matchesCategory && matchesType && p.isPublished;
    });
  }, [products, searchQuery, activeCategory, activeTypeFilter]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const tax = subtotal * 0.11; // 11% PB1
  const grandTotal = subtotal + tax;
  const change = Math.max(0, cashReceived - grandTotal);

  // Broadcast state changes
  useEffect(() => {
    if (bcRef.current) {
      bcRef.current.postMessage({
        cartItems,
        subtotal,
        tax,
        grandTotal,
        paymentModalOpen,
        receiptModalOpen,
        paymentMethod,
        cashReceived,
        change,
        orderType
      });
    }
  }, [cartItems, subtotal, tax, grandTotal, paymentModalOpen, receiptModalOpen, paymentMethod, cashReceived, change, orderType]);

  // -- Action Handlers --

  const handleProductClick = (product: Product) => {
    const availStock = getAvailableStock(product);
    const currentInCart = cartItems.filter(item => item.product.id === product.id).reduce((sum, item) => sum + item.quantity, 0);

    if (currentInCart >= availStock || availStock <= 0) {
      showWarning(
        lang === "en"
          ? `Stock for "${product.name}" is unavailable or fully added to cart.`
          : `Stok "${product.name}" tidak mencukupi atau sudah masuk semua ke keranjang! (Stok tersedia: ${availStock})`,
        lang === "en" ? "Out of Stock" : "Stok Tidak Mencukupi"
      );
      return;
    }

    if (product.variantGroups && product.variantGroups.length > 0) {
      setSelectedProduct(product);
      setTempVariantSelections({});
      setVariantModalOpen(true);
    } else {
      addToCart(product, {});
    }
  };

  const handleVariantToggle = (group: VariantGroup, option: VariantOption) => {
    setTempVariantSelections(prev => {
      const currentSelections = prev[group.id] || [];
      const isSelected = currentSelections.find(o => o.id === option.id);
      
      let newSelections = [...currentSelections];
      
      if (isSelected) {
        newSelections = newSelections.filter(o => o.id !== option.id);
      } else {
        if (group.maxSelections === 1) {
          newSelections = [option];
        } else if (newSelections.length < group.maxSelections) {
          newSelections.push(option);
        }
      }
      
      return { ...prev, [group.id]: newSelections };
    });
  };

  const confirmVariantSelection = () => {
    if (!selectedProduct) return;
    
    // Validate required variants
    if (selectedProduct.variantGroups) {
      for (const group of selectedProduct.variantGroups) {
        if (group.isRequired && (!tempVariantSelections[group.id] || tempVariantSelections[group.id].length === 0)) {
          showWarning(
            lang === "en" ? `Choice for "${group.name}" is required.` : `Pilihan untuk "${group.name}" wajib diisi.`,
            lang === "en" ? "Variant Required" : "Pilihan Wajib"
          );
          return;
        }
      }
    }
    
    addToCart(selectedProduct, tempVariantSelections);
    setVariantModalOpen(false);
    setSelectedProduct(null);
  };

  const addToCart = (product: Product, variants: Record<string, VariantOption[]>) => {
    // Generate a unique ID based on product ID and selected variant IDs
    const variantStr = Object.values(variants)
      .flat()
      .map(v => v.id)
      .sort()
      .join("-");
    const cartItemId = `${product.id}-${variantStr}`;
    
    // Calculate unit price
    const isSurplusSelected = activeTypeFilter === "Surplus" || (activeTypeFilter === "Semua" && product.batches?.some(b => b.menuType === "Surplus"));
    const basePrice = isSurplusSelected ? product.surplusPrice : product.originalPrice;
    let variantsPrice = 0;
    Object.values(variants).flat().forEach(v => { variantsPrice += v.additionalPrice; });
    const unitPrice = basePrice + variantsPrice;

    setCartItems(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * unitPrice }
            : item
        );
      } else {
        return [...prev, {
          id: cartItemId,
          product,
          quantity: 1,
          selectedVariants: variants,
          unitPrice,
          totalPrice: unitPrice
        }];
      }
    });
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCartItems(prev => {
      const targetItem = prev.find(item => item.id === cartItemId);
      if (!targetItem) return prev;

      if (delta > 0) {
        const availStock = getAvailableStock(targetItem.product);
        const currentInCart = prev.filter(item => item.product.id === targetItem.product.id).reduce((sum, item) => sum + item.quantity, 0);
        if (currentInCart + delta > availStock) {
          showWarning(
            lang === "en"
              ? `Cannot add more "${targetItem.product.name}". Max available stock: ${availStock}`
              : `Tidak bisa menambah stok "${targetItem.product.name}". Stok maksimum tersedia: ${availStock}`,
            lang === "en" ? "Stock Limit Reached" : "Batas Stok Tercapai"
          );
          return prev;
        }
      }

      return prev.map(item => {
        if (item.id === cartItemId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice };
        }
        return item;
      });
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  const handlePay = () => {
    if (paymentMethod === "Tunai" && cashReceived < grandTotal) {
      showWarning(t.underpaid, lang === "en" ? "Insufficient Cash" : "Uang Kurang");
      return;
    }
    
    // Add to orders context
    (addOrder as any)({
      customerName: `Walk-in Pelanggan`,
      items: cartItems.map(item => ({
        name: item.product.name,
        qty: item.quantity
      })),
      totalAmount: grandTotal,
      status: "Selesai",
      orderType: orderType === "Dine-In" ? "POS Dine-In" : "POS Take-Away",
      paymentMethod: paymentMethod === "QRIS" ? "QRIS Xendit" : "Tunai",
      paymentDetails: {
        payment_method: paymentMethod === "QRIS" ? "qris" : "cash",
        cash_received: paymentMethod === "Tunai" ? cashReceived : grandTotal,
        change: paymentMethod === "Tunai" ? change : 0,
        provider: paymentMethod === "QRIS" ? "QRIS Xendit" : "Tunai"
      },
      createdAt: new Date().toISOString()
    });

    // Proceed to success/receipt
    setPaymentModalOpen(false);
    setReceiptModalOpen(true);
  };

  const resetTransaction = () => {
    setCartItems([]);
    setCashReceived(0);
    setPaymentMethod("Tunai");
    setOrderType("Dine-In");
    setReceiptModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // -- Render Modals --
  
  const renderVariantModal = () => {
    if (!variantModalOpen || !selectedProduct) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">{t.selectVariant}: {selectedProduct.name}</h3>
            <button onClick={() => setVariantModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 space-y-6">
            {selectedProduct.variantGroups?.map(group => {
              const selectedOptions = tempVariantSelections[group.id] || [];
              return (
                <div key={group.id}>
                  <div className="flex justify-between items-baseline mb-3">
                    <h4 className="font-semibold text-slate-800">{group.name}</h4>
                    <span className="text-xs text-slate-500">
                      {group.isRequired ? t.required : t.optional} 
                      {group.maxSelections > 1 ? ` (Max ${group.maxSelections})` : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {group.options.map(opt => {
                      const isSelected = selectedOptions.some(o => o.id === opt.id);
                      return (
                        <div 
                          key={opt.id}
                          onClick={() => handleVariantToggle(group, opt)}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors flex justify-between items-center ${
                            isSelected ? "border-resurva-dark bg-resurva-green-muted/30" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span className="font-medium text-sm text-slate-800">{opt.name}</span>
                          <span className="text-xs text-slate-500">+{opt.additionalPrice > 0 ? `Rp${opt.additionalPrice.toLocaleString()}` : (lang === "en" ? 'Free' : 'Gratis')}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="p-4 border-t bg-white">
            <Button className="w-full bg-resurva-dark hover:bg-resurva-dark-light text-white h-12 text-lg rounded-xl font-bold" onClick={confirmVariantSelection}>
              {t.confirmAdd}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentModal = () => {
    if (!paymentModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">{t.paymentTitle}</h3>
            <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex gap-4">
              <button 
                onClick={() => setPaymentMethod("Tunai")}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'Tunai' ? 'border-resurva-dark bg-resurva-green-muted/20 text-resurva-dark font-bold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                <Banknote className="w-5 h-5" /> <span>{t.cash}</span>
              </button>
              <button 
                onClick={() => setPaymentMethod("QRIS")}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'QRIS' ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                <QrCode className="w-5 h-5" /> <span>{t.qris}</span>
              </button>
            </div>

            <div className="bg-slate-100 rounded-xl p-6 text-center">
              <p className="text-slate-500 mb-1">{t.totalBill}</p>
              <h2 className="text-4xl font-extrabold text-slate-900">Rp {grandTotal.toLocaleString("id-ID")}</h2>
            </div>

            {paymentMethod === "Tunai" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.cashReceivedLabel}</label>
                  <Input 
                    type="number" 
                    className="h-14 text-2xl font-bold rounded-xl border-slate-200" 
                    value={cashReceived || ""} 
                    onChange={(e) => setCashReceived(Number(e.target.value))} 
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Button variant="outline" className="rounded-xl font-semibold" onClick={() => setCashReceived(grandTotal)}>{t.exactChange}</Button>
                  <Button variant="outline" className="rounded-xl font-semibold" onClick={() => setCashReceived(50000)}>50.000</Button>
                  <Button variant="outline" className="rounded-xl font-semibold" onClick={() => setCashReceived(100000)}>100.000</Button>
                  <Button variant="outline" className="rounded-xl font-semibold" onClick={() => setCashReceived(cashReceived + 10000)}>+10.000</Button>
                </div>
                {cashReceived >= grandTotal && (
                  <div className="flex justify-between items-center p-4 bg-green-50 text-green-800 rounded-xl border border-green-200">
                    <span className="font-semibold">{t.change}:</span>
                    <span className="text-xl font-bold">Rp {change.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                <QrCode className="w-32 h-32 text-slate-400 mb-4 animate-pulse" />
                <p className="font-bold text-slate-700">{t.showQris}</p>
                <p className="text-xs text-slate-500 text-center mt-2 px-8">{t.qrisSim}</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t bg-white">
            <Button 
              className="w-full bg-resurva-dark hover:bg-resurva-dark-light text-white h-14 text-xl font-bold rounded-xl" 
              onClick={handlePay}
              disabled={paymentMethod === 'Tunai' && cashReceived < grandTotal}
            >
              {t.processPayment}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderReceiptModal = () => {
    if (!receiptModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:bg-white print:p-0 animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none">
          <div className="p-8 pb-4 border-b-2 border-dashed flex flex-col items-center text-center">
             <h2 className="text-2xl font-bold text-slate-900 mb-1">UMKM Berkah</h2>
             <p className="text-sm text-slate-500">{t.outletMalang}<br/>{t.outletAddr}</p>
             <p className="text-xs text-slate-400 mt-4">{new Date().toLocaleString('id-ID')}</p>
             <p className="text-sm font-semibold mt-1">Order: {orderType}</p>
          </div>
          
          <div className="p-6 flex-1 space-y-4 text-sm text-slate-700 font-mono">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <p className="font-semibold">{item.product.name}</p>
                  {Object.values(item.selectedVariants).flat().map((v, i) => (
                    <p key={i} className="text-xs text-slate-500">- {v.name}</p>
                  ))}
                  <p className="text-xs text-slate-400 mt-1">{item.quantity} x {item.unitPrice.toLocaleString('id-ID')}</p>
                </div>
                <div className="font-semibold text-right">
                  {item.totalPrice.toLocaleString('id-ID')}
                </div>
              </div>
            ))}
            
            <div className="border-t-2 border-dashed pt-4 mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>PB1 (11%)</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            <div className="border-t-2 border-solid pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-lg font-bold text-slate-900">
                <span>TOTAL</span>
                <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>{paymentMethod}</span>
                <span>Rp {(paymentMethod === "Tunai" ? cashReceived : grandTotal).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.change}</span>
                <span>Rp {change.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 text-center border-t-2 border-dashed bg-slate-50 print:bg-white print:border-none">
            <p className="text-sm font-medium mb-4">{t.thanks}</p>
            <div className="flex gap-3 print:hidden">
              <Button variant="outline" className="flex-1 rounded-xl font-semibold" onClick={handlePrint}>
                {t.printBtn}
              </Button>
              <Button className="flex-1 bg-resurva-dark hover:bg-resurva-dark-light text-white rounded-xl font-semibold" onClick={resetTransaction}>
                {t.doneBtn}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWarningModal = () => {
    if (!warningModal.open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in print:hidden">
        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col p-6 text-center border border-amber-100">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">{warningModal.title}</h3>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {warningModal.message}
          </p>
          <Button
            onClick={() => setWarningModal({ open: false, title: "", message: "" })}
            className="w-full bg-resurva-dark hover:bg-resurva-dark-light text-white font-bold h-12 text-base rounded-xl shadow-md cursor-pointer"
          >
            {lang === "en" ? "Understood" : "Saya Mengerti"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden relative">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col bg-slate-100 border-r border-slate-200 min-w-0">
        <div className="p-4 bg-white border-b border-slate-200 flex flex-col gap-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input 
                placeholder={t.searchPlaceholder} 
                className="pl-10 h-12 bg-slate-50 border-none rounded-xl" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Surplus/Reguler Toggle Filter */}
            <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
              {([
                { key: "Semua", en: "All", id: "Semua" },
                { key: "Surplus", en: "Surplus", id: "Surplus" },
                { key: "Reguler", en: "Regular", id: "Reguler" }
              ] as const).map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveTypeFilter(item.key)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTypeFilter === item.key
                      ? "bg-white text-resurva-dark shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {lang === "en" ? item.en : item.id}
                </button>
              ))}
            </div>
            
            {/* Customer Display Button */}
            <Button 
              onClick={openCustomerDisplay}
              variant="outline"
              className="shrink-0 border-resurva-dark text-resurva-dark hover:bg-resurva-dark hover:text-white rounded-xl gap-2 font-bold hidden md:flex"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              {lang === "en" ? "Customer Screen" : "Layar Pelanggan"}
            </Button>
          </div>
          {/* Categories Tab */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 border-t border-slate-100 pt-2">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap font-medium text-xs transition-colors cursor-pointer ${
                  activeCategory === cat ? "bg-resurva-dark text-white shadow-xs" : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 pb-24 lg:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => {
              const isSurplusMode = activeTypeFilter === "Surplus" || (activeTypeFilter === "Semua" && product.batches?.some(b => b.menuType === "Surplus"));
              const price = isSurplusMode ? product.surplusPrice : product.originalPrice;
              const hasVariants = product.variantGroups && product.variantGroups.length > 0;
              return (
                <div 
                  key={product.id} 
                  onClick={() => handleProductClick(product)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-resurva-dark/30 group flex flex-col"
                >
                  <div className="h-32 bg-slate-200 relative overflow-hidden shrink-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">IMG</div>
                    )}
                    {isSurplusMode && (
                      <div className="absolute top-2 right-2 bg-resurva-gold text-resurva-dark text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                        SURPLUS
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h3 className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2">{product.name}</h3>
                        {(() => {
                          const availStock = getAvailableStock(product);
                          return (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${availStock > 0 ? "bg-slate-100 text-slate-600 border border-slate-200" : "bg-red-100 text-red-600 border border-red-200"}`}>
                              {availStock > 0 ? `Stok ${availStock}` : "Habis"}
                            </span>
                          );
                        })()}
                      </div>
                      {hasVariants && <span className="text-[10px] text-slate-400 mt-1 block">{t.availableVariant}</span>}
                    </div>
                    <div>
                      {isSurplusMode && (
                         <p className="text-[10px] text-slate-400 line-through">Rp {product.originalPrice.toLocaleString('id-ID')}</p>
                      )}
                      <p className="font-bold text-resurva-dark">Rp {price.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Cart Backdrop */}
      {mobileCartOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setMobileCartOpen(false)}
        />
      )}

      {/* Right: Cart Panel */}
      <div className={`w-full lg:w-96 bg-white flex flex-col shrink-0 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] z-40 fixed lg:static inset-y-0 right-0 h-full lg:h-auto transition-transform duration-300 transform ${mobileCartOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
            <ShoppingCart className="w-5 h-5 text-resurva-dark" />
            {t.cartTitle}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCartItems([])} className="text-red-500 hover:text-red-600 hover:bg-red-50" disabled={cartItems.length === 0}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t.clearBtn}
            </Button>
            <button 
              onClick={() => setMobileCartOpen(false)} 
              className="p-2 lg:hidden text-slate-400 hover:text-slate-600 font-bold text-lg rounded-lg hover:bg-slate-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Dine-In / Take-away Toggle */}
        <div className="p-4 border-b border-slate-100 flex gap-2 shrink-0 bg-white">
           <button 
             onClick={() => setOrderType("Dine-In")}
             className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${orderType === 'Dine-In' ? 'bg-resurva-dark text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
           >
             {t.dineIn}
           </button>
           <button 
             onClick={() => setOrderType("Take-Away")}
             className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${orderType === 'Take-Away' ? 'bg-resurva-dark text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
           >
             {t.takeAway}
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p>{t.emptyCart}</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex flex-col p-3 border border-slate-100 rounded-xl bg-white shadow-sm gap-3 relative group">
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm leading-snug">{item.product.name}</h4>
                    {Object.values(item.selectedVariants).flat().map(v => (
                       <p key={v.id} className="text-[10px] text-slate-500">+ {v.name}</p>
                    ))}
                    {(() => {
                      const activeBatch = getActiveBatch(item.product);
                      if (!activeBatch) return null;
                      return (
                        <div className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.5 rounded-md mt-1">
                          <Tag className="w-2.5 h-2.5 text-amber-600" />
                          <span>{activeBatch.batchTag || "FIFO Batch"}</span>
                          {activeBatch.expiryDate && (
                            <span className="text-amber-600/80">• Exp: {new Date(activeBatch.expiryDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-resurva-dark text-sm">Rp {item.totalPrice.toLocaleString("id-ID")}</p>
                    <p className="text-[10px] text-slate-400">@ {item.unitPrice.toLocaleString("id-ID")}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                    <button onClick={() => updateCartQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-resurva-dark">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-resurva-dark">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 space-y-3 pb-8 lg:pb-4">
          <div className="space-y-1 mb-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>{t.subtotal}</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>{t.tax}</span>
              <span>Rp {tax.toLocaleString("id-ID")}</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-lg font-bold text-slate-900 border-t border-slate-200 pt-3">
            <span>{t.total}</span>
            <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
          </div>
          <Button 
            className="w-full bg-resurva-gold hover:bg-resurva-gold/80 text-resurva-dark font-bold h-14 text-lg shadow-md mt-2" 
            disabled={cartItems.length === 0}
            onClick={() => {
              setMobileCartOpen(false);
              setPaymentModalOpen(true);
            }}
          >
            {t.payBtn}
          </Button>
        </div>
      </div>

      {/* Floating Mobile Cart Button */}
      {cartItems.length > 0 && !mobileCartOpen && (
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-20">
          <button 
            onClick={() => setMobileCartOpen(true)}
            className="w-full bg-resurva-gold hover:bg-resurva-gold/90 text-resurva-dark font-bold py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-between transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-resurva-gold">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <span>{lang === "en" ? "View Cart" : "Lihat Keranjang"}</span>
            </div>
            <span className="font-extrabold">Rp {grandTotal.toLocaleString("id-ID")}</span>
          </button>
        </div>
      )}

      {renderVariantModal()}
      {renderPaymentModal()}
      {renderReceiptModal()}
      {renderWarningModal()}
    </div>
  );
}
