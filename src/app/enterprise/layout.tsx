"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SharedSidebar, MenuItem, ProfileInfo } from "@/components/layout/SharedSidebar";
import { SharedHeader } from "@/components/layout/SharedHeader";
import { AIAssistantWidget } from "@/components/enterprise/AIAssistantWidget";

const enterpriseMenus: MenuItem[] = [
  { name: "Waste Analytics", href: "/enterprise/analytics" },
  { name: "SDG Sustainability", href: "/enterprise/sustainability" },
  { name: "Leaderboard Mitra", href: "/enterprise/leaderboard" },
  { name: "Manajemen Mitra", href: "/enterprise/partners" },
  { name: "Profil", href: "/enterprise/profile" },
];

const enterpriseProfile: ProfileInfo = {
  name: "PT Resurva Group",
  subtext: "Pusat Manajemen",
  initials: "HQ",
};

const titleMapping = {
  "/enterprise/analytics": "Waste Analytics & Multi-Branch Control",
  "/enterprise/sustainability": "Sustainability Reporting (SDG)",
  "/enterprise/leaderboard": "Leaderboard Kinerja Mitra",
  "/enterprise/partners": "Manajemen Mitra",
  "/enterprise/profile": "Profil Perusahaan",
};

export default function EnterpriseLayout({
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
        roleName="Enterprise" 
        menus={enterpriseMenus} 
        profile={enterpriseProfile} 
        isOpen={isSidebarOpen}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <SharedHeader 
          pageTitleMapping={titleMapping} 
          defaultTitle="Enterprise Dashboard" 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
        <AIAssistantWidget />
      </div>
    </div>
  );
}
