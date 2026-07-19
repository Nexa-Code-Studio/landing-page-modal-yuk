"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SharedSidebar, MenuItem, ProfileInfo } from "@/components/layout/SharedSidebar";
import { SharedHeader } from "@/components/layout/SharedHeader";

const superadminMenus: MenuItem[] = [
  { name: "Dashboard", href: "/superadmin" },
  { name: "Manajemen Pengguna", href: "/superadmin/users" },
  { name: "Verifikasi Merchant", href: "/superadmin/verifications/merchant" },
  { name: "Verifikasi Enterprise", href: "/superadmin/verifications/enterprise" },
  { name: "Log Sistem", href: "/superadmin/logs" },
];

const superadminProfile: ProfileInfo = {
  name: "System Administrator",
  subtext: "Pusat Kendali",
  initials: "SA",
};

const titleMapping = {
  "/superadmin/users": "Manajemen Pengguna Aplikasi",
  "/superadmin/verifications/merchant": "Verifikasi Pendaftaran Merchant",
  "/superadmin/verifications/enterprise": "Verifikasi Pendaftaran Enterprise",
  "/superadmin/logs": "Riwayat Log Sistem",
  "/superadmin": "Superadmin Area",
};

export default function SuperadminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <div className="h-screen w-full flex bg-slate-50 text-slate-900 overflow-hidden relative">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <SharedSidebar 
        roleName="Superadmin" 
        menus={superadminMenus} 
        profile={superadminProfile} 
        isOpen={isSidebarOpen}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <SharedHeader 
          pageTitleMapping={titleMapping} 
          defaultTitle="Superadmin Dashboard" 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
