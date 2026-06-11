"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/enterprise/analytics") return "Waste Analytics & Multi-Branch Control";
    if (pathname === "/enterprise/sustainability") return "Sustainability Reporting (SDG)";
    if (pathname === "/enterprise/leaderboard") return "Leaderboard Kinerja Mitra";
    return "Enterprise Dashboard";
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <h1 className="text-xl font-semibold text-slate-800">{getPageTitle()}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-500">Mode: Enterprise View</span>
      </div>
    </header>
  );
}
