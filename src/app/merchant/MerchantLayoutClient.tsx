"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SharedSidebar, MenuItem, ProfileInfo } from "@/components/layout/SharedSidebar";
import { SharedHeader } from "@/components/layout/SharedHeader";
import { MerchantProvider, useMerchantContext } from "@/lib/contexts/MerchantContext";

function MerchantLayoutContent({ children }: { children: React.ReactNode }) {
  const { activeOrdersCount, store } = useMerchantContext();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "id">("en");

  const profileName = store?.name || "UMKM Berkah";
  const profileSubtext = store?.city ? `Cabang ${store.city}` : "Cabang Malang";

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  const profileInitials = getInitials(profileName);

  const merchantProfile: ProfileInfo = {
    name: profileName,
    subtext: profileSubtext,
    initials: profileInitials,
  };

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

  const titleMapping = lang === "en" ? {
    "/merchant": "Dashboard",
    "/merchant/pos": "Cashier / Point of Sale",
    "/merchant/analytics": "Store Analytics",
    "/merchant/inventory": "Inventory Management",
    "/merchant/finance": "Finance Tracking",
    "/merchant/orders": "Orders & Logistics",
    "/merchant/ai-chat": "AI Chat",
    "/merchant/profile": "Store Profile",
  } : {
    "/merchant": "Dasbor",
    "/merchant/pos": "Kasir / Point of Sale",
    "/merchant/analytics": "Analitik Toko",
    "/merchant/inventory": "Manajemen Inventaris",
    "/merchant/finance": "Pencatatan Keuangan",
    "/merchant/orders": "Pesanan & Logistik",
    "/merchant/ai-chat": "AI Chat",
    "/merchant/profile": "Profil Toko",
  };

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  const menus: MenuItem[] = lang === "en" ? [
    { name: "Dashboard", href: "/merchant" },
    { name: "Cashier (POS)", href: "/merchant/pos" },
    { name: "Store Analytics", href: "/merchant/analytics" },
    { name: "Inventory", href: "/merchant/inventory" },
    { name: "Finance", href: "/merchant/finance" },
    { 
      name: "Orders", 
      href: "/merchant/orders",
      badge: activeOrdersCount > 0 ? activeOrdersCount.toString() : undefined
    },
    { name: "AI Chat", href: "/merchant/ai-chat" },
    { name: "Store Profile", href: "/merchant/profile" },
  ] : [
    { name: "Dasbor", href: "/merchant" },
    { name: "Kasir (POS)", href: "/merchant/pos" },
    { name: "Analitik Toko", href: "/merchant/analytics" },
    { name: "Inventaris", href: "/merchant/inventory" },
    { name: "Keuangan", href: "/merchant/finance" },
    { 
      name: "Pesanan", 
      href: "/merchant/orders",
      badge: activeOrdersCount > 0 ? activeOrdersCount.toString() : undefined
    },
    { name: "AI Chat", href: "/merchant/ai-chat" },
    { name: "Profil Toko", href: "/merchant/profile" },
  ];

  const isCustomerPage = pathname.startsWith("/merchant/pos/customer");

  if (isCustomerPage) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-slate-50 text-slate-900 overflow-hidden relative">
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

export default function MerchantLayoutClient({
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
