"use client";

import React, { useState } from "react";
import { useMerchantContext } from "@/lib/contexts/MerchantContext";

interface MobilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobilePreviewModal({ isOpen, onClose }: MobilePreviewModalProps) {
  const { products } = useMerchantContext();
  const [activeTab, setActiveTab] = useState<"Surplus" | "Reguler">("Surplus");

  // Filter only published products based on active tab
  const publishedProducts = products.filter(
    (p) => p.isPublished && (p.menuType === activeTab || (!p.menuType && activeTab === "Surplus"))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Mobile Device Mockup */}
      <div className="relative w-[360px] h-[720px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-[12px] border-gray-900 flex flex-col">
        
        {/* Hardware Status Bar Mock */}
        <div className="h-6 w-full bg-black flex items-center justify-between px-6 text-[10px] text-white shrink-0">
          <span className="font-semibold">9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">5G</span>
            <div className="w-4 h-2.5 bg-white rounded-sm"></div>
          </div>
        </div>

        {/* Dynamic Island / Notch */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center pointer-events-none">
          <div className="w-32 h-6 bg-black rounded-b-2xl"></div>
        </div>

        {/* App Header (Resurva Style) */}
        <div className="bg-resurva-dark p-4 text-white flex items-center gap-3 shrink-0 pt-6 shadow-sm z-10 relative">
           <button className="p-1 -ml-1">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
             </svg>
           </button>
           <div>
             <h1 className="font-bold text-lg leading-tight">UMKM Berkah</h1>
             <p className="text-xs text-resurva-green-muted flex items-center gap-1 mt-0.5">
               <span className="w-2 h-2 rounded-full bg-green-400 block"></span>
               Buka • 1.2 km
             </p>
           </div>
        </div>

        {/* Tabs */}
        <div className="bg-white flex border-b border-slate-200 text-sm font-medium shrink-0 shadow-sm z-10 relative">
          <button 
            className={`flex-1 py-3 text-center transition-colors ${activeTab === 'Surplus' ? 'text-resurva-dark border-b-2 border-resurva-dark' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('Surplus')}
          >
            Menu Surplus
          </button>
          <button 
            className={`flex-1 py-3 text-center transition-colors ${activeTab === 'Reguler' ? 'text-resurva-dark border-b-2 border-resurva-dark' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('Reguler')}
          >
            Menu Reguler
          </button>
        </div>

        {/* App Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 pb-20">
          <h2 className="font-bold text-slate-800 mb-4 text-lg">
            {activeTab === 'Surplus' ? 'Penawaran Spesial Hari Ini' : 'Menu Favorit'}
          </h2>
          
          {publishedProducts.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2l2 2h8a2 2 0 012 2v2M4 10h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10z" />
              </svg>
              <p className="text-sm">Toko belum mempublikasikan produk.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {publishedProducts.map((product) => (
                <div key={product.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex gap-3">
                  <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                    {product.imageUrl ? (
                       <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-medium">No Image</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">{product.name}</h3>
                      {product.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">{product.description}</p>
                      )}
                    </div>
                    <div className="mt-2 flex items-end justify-between">
                      <div>
                        {activeTab === "Surplus" ? (
                          <>
                            <p className="text-xs text-slate-400 line-through">Rp {product.originalPrice.toLocaleString('id-ID')}</p>
                            <p className="text-sm font-bold text-green-600">Rp {product.surplusPrice.toLocaleString('id-ID')}</p>
                          </>
                        ) : (
                          <p className="text-sm font-bold text-slate-900">Rp {product.originalPrice.toLocaleString('id-ID')}</p>
                        )}
                      </div>
                      <button className="bg-resurva-gold text-resurva-dark w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm active:scale-95 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Nav Mock */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around text-slate-400 pb-2 z-10">
           <div className="flex flex-col items-center gap-1 text-resurva-dark">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
             </svg>
             <span className="text-[10px] font-medium">Beranda</span>
           </div>
           <div className="flex flex-col items-center gap-1">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
             <span className="text-[10px] font-medium">Cari</span>
           </div>
           <div className="flex flex-col items-center gap-1">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
             </svg>
             <span className="text-[10px] font-medium">Profil</span>
           </div>
        </div>

      </div>

      {/* Close Button Outside */}
      <div className="absolute top-6 right-6 flex flex-col items-center gap-2">
        <button 
          onClick={onClose}
          className="text-white bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors backdrop-blur-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="text-white text-xs font-medium">Tutup Preview</span>
      </div>
    </div>
  );
}
