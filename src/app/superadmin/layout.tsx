"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SharedSidebar, MenuItem, ProfileInfo } from "@/components/layout/SharedSidebar";
import { SharedHeader } from "@/components/layout/SharedHeader";

const superadminMenus: MenuItem[] = [
  { name: "Manajemen Mitra", href: "/superadmin/partners" },
];

const superadminProfile: ProfileInfo = {
  name: "System Administrator",
  subtext: "Pusat Kendali",
  initials: "SA",
};

const titleMapping = {
  "/superadmin/partners": "Manajemen Mitra & Cabang",
  "/superadmin": "Superadmin Area",
};

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Open sidebar by default on desktop screens
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
