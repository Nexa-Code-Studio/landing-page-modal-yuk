"use client";

import React, { useState, useMemo } from "react";
import { useMerchantContext, Product, VariantGroup, VariantOption } from "@/lib/contexts/MerchantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Minus, Plus, Trash2, Receipt, Banknote, QrCode } from "lucide-react";

interface CartItem {
  id: string; // Unique ID for cart entry (differentiates same product with different variants)
  product: Product;
  quantity: number;
  selectedVariants: Record<string, VariantOption[]>; // groupId -> selected options
  unitPrice: number; // Base price + variants
  totalPrice: number; // unitPrice * qty
}

type OrderType = "Dine-In" | "Take-Away";

export default function POSPage() {
  const { products, addOrder } = useMerchantContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [orderType, setOrderType] = useState<OrderType>("Dine-In");
  
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

  // Derived state
  const categories = ["Semua", ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "Semua" || p.category === activeCategory;
      return matchesSearch && matchesCategory && p.isPublished;
    });
  }, [products, searchQuery, activeCategory]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const tax = subtotal * 0.11; // 11% PB1
  const grandTotal = subtotal + tax;
  const change = Math.max(0, cashReceived - grandTotal);

  // -- Action Handlers --

  const handleProductClick = (product: Product) => {
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
          alert(`Pilihan untuk "${group.name}" wajib diisi.`);
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
    const basePrice = product.menuType === "Surplus" ? product.surplusPrice : product.originalPrice;
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
    setCartItems(prev => prev.map(item => {
      if (item.id === cartItemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  const handlePay = () => {
    if (paymentMethod === "Tunai" && cashReceived < grandTotal) {
      alert("Uang yang diterima kurang dari total pembayaran.");
      return;
    }
    
    // Add to orders context
    addOrder({
      customerName: `Walk-in (${orderType})`,
      items: cartItems.map(item => ({
        name: item.product.name,
        qty: item.quantity
      })),
      totalAmount: grandTotal,
      status: "Selesai",
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Pilih Varian: {selectedProduct.name}</h3>
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
                      {group.isRequired ? "Wajib" : "Opsional"} 
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
                          <span className="text-xs text-slate-500">+{opt.additionalPrice > 0 ? `Rp${opt.additionalPrice.toLocaleString()}` : 'Gratis'}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="p-4 border-t bg-white">
            <Button className="w-full bg-resurva-dark hover:bg-resurva-dark-light text-white h-12 text-lg" onClick={confirmVariantSelection}>
              Konfirmasi & Tambah
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentModal = () => {
    if (!paymentModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
        <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Pembayaran</h3>
            <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex gap-4">
              <button 
                onClick={() => setPaymentMethod("Tunai")}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'Tunai' ? 'border-resurva-dark bg-resurva-green-muted/20 text-resurva-dark' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                <Banknote className="w-5 h-5" /> <span className="font-bold">Tunai</span>
              </button>
              <button 
                onClick={() => setPaymentMethod("QRIS")}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'QRIS' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                <QrCode className="w-5 h-5" /> <span className="font-bold">QRIS (Xendit)</span>
              </button>
            </div>

            <div className="bg-slate-100 rounded-xl p-6 text-center">
              <p className="text-slate-500 mb-1">Total Tagihan</p>
              <h2 className="text-4xl font-extrabold text-slate-900">Rp {grandTotal.toLocaleString("id-ID")}</h2>
            </div>

            {paymentMethod === "Tunai" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Uang Diterima (Rp)</label>
                  <Input 
                    type="number" 
                    className="h-14 text-2xl font-bold" 
                    value={cashReceived || ""} 
                    onChange={(e) => setCashReceived(Number(e.target.value))} 
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Button variant="outline" onClick={() => setCashReceived(grandTotal)}>Uang Pas</Button>
                  <Button variant="outline" onClick={() => setCashReceived(50000)}>50.000</Button>
                  <Button variant="outline" onClick={() => setCashReceived(100000)}>100.000</Button>
                  <Button variant="outline" onClick={() => setCashReceived(cashReceived + 10000)}>+10.000</Button>
                </div>
                {cashReceived >= grandTotal && (
                  <div className="flex justify-between items-center p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
                    <span className="font-medium">Kembalian:</span>
                    <span className="text-xl font-bold">Rp {change.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                <QrCode className="w-32 h-32 text-slate-400 mb-4" />
                <p className="font-medium text-slate-700">Tampilkan QRIS Xendit di Layar Pelanggan</p>
                <p className="text-sm text-slate-500 text-center mt-2 px-8">Simulasi: Anggap pelanggan sudah *scan* dan bayar via E-Wallet/M-Banking.</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t bg-white">
            <Button 
              className="w-full bg-resurva-dark hover:bg-resurva-dark-light text-white h-14 text-xl font-bold" 
              onClick={handlePay}
              disabled={paymentMethod === 'Tunai' && cashReceived < grandTotal}
            >
              Proses Pembayaran
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderReceiptModal = () => {
    if (!receiptModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:bg-white print:p-0">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none">
          <div className="p-8 pb-4 border-b-2 border-dashed flex flex-col items-center text-center">
             <h2 className="text-2xl font-bold text-slate-900 mb-1">UMKM Berkah</h2>
             <p className="text-sm text-slate-500">Cabang Malang<br/>Jl. Contoh No 123</p>
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
                <span>Kembalian</span>
                <span>Rp {change.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 text-center border-t-2 border-dashed bg-slate-50 print:bg-white print:border-none">
            <p className="text-sm font-medium mb-4">Terima kasih atas kunjungannya!</p>
            <div className="flex gap-3 print:hidden">
              <Button variant="outline" className="flex-1" onClick={handlePrint}>
                Cetak Struk
              </Button>
              <Button className="flex-1 bg-resurva-dark hover:bg-resurva-dark-light text-white" onClick={resetTransaction}>
                Selesai
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // -- Main UI --

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col bg-slate-100 border-r border-slate-200">
        <div className="p-4 bg-white border-b border-slate-200 flex gap-4 items-center shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Cari menu..." 
              className="pl-10 h-12 bg-slate-50 border-none" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-colors ${
                  activeCategory === cat ? "bg-resurva-dark text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => {
              const price = product.menuType === "Surplus" ? product.surplusPrice : product.originalPrice;
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
                    {product.menuType === "Surplus" && (
                      <div className="absolute top-2 right-2 bg-resurva-gold text-resurva-dark text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                        SURPLUS
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2">{product.name}</h3>
                      {hasVariants && <span className="text-[10px] text-slate-400 mt-1 block">Tersedia Varian</span>}
                    </div>
                    <div>
                      {product.menuType === "Surplus" && (
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

      {/* Right: Cart Panel */}
      <div className="w-96 bg-white flex flex-col shrink-0 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
            <ShoppingCart className="w-5 h-5 text-resurva-dark" />
            Pesanan
          </div>
          <Button variant="ghost" size="sm" onClick={() => setCartItems([])} className="text-red-500 hover:text-red-600 hover:bg-red-50" disabled={cartItems.length === 0}>
            <Trash2 className="w-4 h-4 mr-2" />
            Kosongkan
          </Button>
        </div>
        
        {/* Dine-In / Take-away Toggle */}
        <div className="p-4 border-b border-slate-100 flex gap-2 shrink-0 bg-white">
           <button 
             onClick={() => setOrderType("Dine-In")}
             className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${orderType === 'Dine-In' ? 'bg-resurva-dark text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
           >
             Makan di Tempat
           </button>
           <button 
             onClick={() => setOrderType("Take-Away")}
             className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${orderType === 'Take-Away' ? 'bg-resurva-dark text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
           >
             Bungkus
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p>Belum ada pesanan</p>
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

        <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 space-y-3">
          <div className="space-y-1 mb-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Pajak Resto (11%)</span>
              <span>Rp {tax.toLocaleString("id-ID")}</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-lg font-bold text-slate-900 border-t border-slate-200 pt-3">
            <span>TOTAL</span>
            <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
          </div>
          <Button 
            className="w-full bg-resurva-gold hover:bg-resurva-gold/80 text-resurva-dark font-bold h-14 text-lg shadow-md mt-2" 
            disabled={cartItems.length === 0}
            onClick={() => setPaymentModalOpen(true)}
          >
            Bayar Pesanan
          </Button>
        </div>
      </div>

      {renderVariantModal()}
      {renderPaymentModal()}
      {renderReceiptModal()}
    </div>
  );
}
