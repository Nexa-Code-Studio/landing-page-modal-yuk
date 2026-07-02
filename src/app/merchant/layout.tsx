"use client";

import React, { useState } from "react";
import { SharedSidebar, MenuItem, ProfileInfo } from "@/components/layout/SharedSidebar";
import { SharedHeader } from "@/components/layout/SharedHeader";
import { MerchantProvider } from "@/lib/contexts/MerchantContext";

const merchantMenus: MenuItem[] = [
  { name: "Dashboard", href: "/merchant" },
  { name: "Kasir (POS)", href: "/merchant/pos" },
  { name: "Inventaris", href: "/merchant/inventory" },
  { name: "Pesanan", href: "/merchant/orders" },
];

const merchantProfile: ProfileInfo = {
  name: "UMKM Berkah",
  subtext: "Cabang Malang",
  initials: "UM",
};

const titleMapping = {
  "/merchant": "Dashboard",
  "/merchant/pos": "Kasir / Point of Sale",
  "/merchant/inventory": "Manajemen Inventaris",
  "/merchant/orders": "Pesanan & Logistik",
};

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <MerchantProvider>
      <div className="h-screen w-full flex bg-slate-50 text-slate-900 overflow-hidden">
        <SharedSidebar 
          roleName="Merchant" 
          menus={merchantMenus} 
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
    </MerchantProvider>
  );
}
