"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SharedSidebar, MenuItem, ProfileInfo } from "@/components/layout/SharedSidebar";
import { SharedHeader } from "@/components/layout/SharedHeader";
import { MerchantProvider, useMerchantContext } from "@/lib/contexts/MerchantContext";

const merchantProfile: ProfileInfo = {
  name: "UMKM Berkah",
  subtext: "Cabang Malang",
  initials: "UM",
};

const titleMapping = {
  "/merchant": "Dashboard",
  "/merchant/pos": "Kasir / Point of Sale",
  "/merchant/analytics": "Analitik Toko",
  "/merchant/inventory": "Manajemen Inventaris",
  "/merchant/orders": "Pesanan & Logistik",
};

function MerchantLayoutContent({ children }: { children: React.ReactNode }) {
  const { orders } = useMerchantContext();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Open/close sidebar based on initial screen size
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  const newOrdersCount = orders.filter(o => o.status === "Menunggu Konfirmasi").length;

  const menus: MenuItem[] = [
    { name: "Dashboard", href: "/merchant" },
    { name: "Kasir (POS)", href: "/merchant/pos" },
    { name: "Analitik Toko", href: "/merchant/analytics" },
    { name: "Inventaris", href: "/merchant/inventory" },
    { 
      name: "Pesanan", 
      href: "/merchant/orders",
      badge: newOrdersCount > 0 ? newOrdersCount.toString() : undefined
    },
  ];

  return (
    <div className="h-screen w-full flex bg-slate-50 text-slate-900 overflow-hidden relative">
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <SharedSidebar 
        roleName="Merchant" 
        menus={menus} 
        profile={merchantProfile} 
        isOpen={isSidebarOpen}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <SharedHeader 
          pageTitleMapping={titleMapping} 
          defaultTitle="Merchant Area" 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MerchantProvider>
      <MerchantLayoutContent>{children}</MerchantLayoutContent>
    </MerchantProvider>
  );
}
