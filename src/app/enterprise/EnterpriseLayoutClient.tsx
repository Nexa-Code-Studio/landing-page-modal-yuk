"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SharedSidebar, MenuItem, ProfileInfo } from "@/components/layout/SharedSidebar";
import { SharedHeader } from "@/components/layout/SharedHeader";
import { apiClient, getStoredUser } from "@/lib/api";

const enterpriseMenus: MenuItem[] = [
  { name: "Waste Analytics", href: "/enterprise/analytics" },
  { name: "SDG Sustainability", href: "/enterprise/sustainability" },
  { name: "Leaderboard Mitra", href: "/enterprise/leaderboard" },
  { name: "Manajemen Mitra", href: "/enterprise/partners" },
  { name: "Keuangan", href: "/enterprise/finance" },
  { name: "Profil", href: "/enterprise/profile" },
  { name: "Chat AI", href: "/enterprise/chat" },
];

const defaultProfile: ProfileInfo = {
  name: "PT Resurva Group",
  subtext: "Pusat Manajemen",
  initials: "HQ",
};

const titleMapping = {
  "/enterprise/analytics": "Waste Analytics & Multi-Branch Control",
  "/enterprise/sustainability": "Sustainability Reporting (SDG)",
  "/enterprise/leaderboard": "Leaderboard Kinerja Mitra",
  "/enterprise/partners": "Manajemen Mitra",
  "/enterprise/finance": "Keuangan & Cashflow HQ",
  "/enterprise/profile": "Profil Perusahaan",
  "/enterprise/chat": "Chat AI Assistant",
};

export default function EnterpriseLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileInfo>(defaultProfile);

  useEffect(() => {
    async function loadSidebarProfile() {
      const user = getStoredUser();
      let bId = user?.business_id;
      if (!bId) {
        try {
          const bs = await apiClient.get<any[]>("/business");
          if (bs && bs.length > 0) bId = bs[0].id;
        } catch (e) {}
      }
      if (bId) {
        try {
          const b = await apiClient.get<any>(`/business/${bId}`);
          if (b && b.name) {
            const name = b.name;
            const parts = name.trim().split(/\s+/);
            const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
            setProfile({
              name: name,
              subtext: b.legal_entity || "Pusat Manajemen",
              initials: initials,
            });
          }
        } catch (err) {
          console.warn("Failed to load enterprise sidebar profile:", err);
        }
      }
    }
    loadSidebarProfile();
  }, []);

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
        roleName="Enterprise" 
        menus={enterpriseMenus} 
        profile={profile} 
        isOpen={isSidebarOpen}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <SharedHeader 
          pageTitleMapping={titleMapping} 
          defaultTitle="Enterprise Dashboard" 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
