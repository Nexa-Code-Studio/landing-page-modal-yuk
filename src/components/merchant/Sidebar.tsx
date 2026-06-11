"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/merchant" },
  { name: "Inventaris", href: "/merchant/inventory" },
  { name: "Pesanan", href: "/merchant/orders" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-xl font-bold text-green-700">RESURVA</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive =
            item.href === "/merchant"
              ? pathname === "/merchant"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold">
            UM
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">UMKM Berkah</p>
            <p className="text-xs text-gray-500">Cabang Malang</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
