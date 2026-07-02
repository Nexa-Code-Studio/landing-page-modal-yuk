import React from "react";
import { SharedSidebar, MenuItem, ProfileInfo } from "@/components/layout/SharedSidebar";
import { SharedHeader } from "@/components/layout/SharedHeader";

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
  return (
    <div className="h-screen w-full flex bg-slate-50 text-slate-900 overflow-hidden">
      <SharedSidebar 
        roleName="Enterprise" 
        menus={enterpriseMenus} 
        profile={enterpriseProfile} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <SharedHeader 
          pageTitleMapping={titleMapping} 
          defaultTitle="Enterprise Dashboard" 
        />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
