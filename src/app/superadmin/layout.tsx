import React from "react";
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
  return (
    <div className="h-screen w-full flex bg-slate-50 text-slate-900 overflow-hidden">
      <SharedSidebar 
        roleName="Superadmin" 
        menus={superadminMenus} 
        profile={superadminProfile} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <SharedHeader 
          pageTitleMapping={titleMapping} 
          defaultTitle="Superadmin Dashboard" 
        />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
