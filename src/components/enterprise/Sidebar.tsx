"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Waste Analytics", href: "/enterprise/analytics" },
  { name: "SDG Sustainability", href: "/enterprise/sustainability" },
  { name: "Leaderboard Mitra", href: "/enterprise/leaderboard" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="text-xl font-bold text-white">RESURVA <span className="text-indigo-400">Enterprise</span></span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
            HQ
          </div>
          <div>
            <p className="text-sm font-medium text-white">PT Resurva Group</p>
            <p className="text-xs text-slate-400">Pusat Manajemen</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
