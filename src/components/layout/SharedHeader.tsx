"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, Package, AlertTriangle, Truck } from "lucide-react";

// Mock Data Notifikasi
const mockNotifications = [
  { id: 1, type: "flash-sale", title: "Produk Mendekati Kedaluwarsa", message: "Roti Cokelat sisa 12 jam, masuk kategori Flash Sale.", time: "Baru saja", icon: AlertTriangle, color: "text-red-500 bg-red-100" },
  { id: 2, type: "order", title: "Pesanan Baru Masuk", message: "Budi Santoso memesan 2x Roti Cokelat (ORD-001).", time: "5 mnt lalu", icon: Package, color: "text-blue-500 bg-blue-100" },
  { id: 3, type: "courier", title: "Kurir Menuju Outlet", message: "Kurir Biteship sedang menuju ke outlet Anda untuk ORD-002.", time: "15 mnt lalu", icon: Truck, color: "text-purple-500 bg-purple-100" }
];

interface SharedHeaderProps {
  pageTitleMapping: Record<string, string>;
  defaultTitle: string;
}

export function SharedHeader({ pageTitleMapping, defaultTitle }: SharedHeaderProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(mockNotifications.length);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadCount(0);
    }
  };

  const getPageTitle = () => {
    // Find exact match or startsWith (for dynamic routes)
    for (const [path, title] of Object.entries(pageTitleMapping)) {
      if (pathname === path || (path.split("/").length > 2 && pathname.startsWith(path))) {
        return title;
      }
    }
    return defaultTitle;
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
      <h1 className="text-xl font-semibold text-slate-800">{getPageTitle()}</h1>
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {/* Notifications */}
        <button 
          onClick={handleNotificationClick}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute top-12 right-0 w-80 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Notifikasi</h3>
              <span className="text-xs text-resurva-dark-light bg-resurva-green-muted px-2 py-1 rounded-full font-medium">Baru</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {mockNotifications.map((notif) => {
                const Icon = notif.icon;
                return (
                  <div key={notif.id} className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors flex gap-3 items-start cursor-pointer">
                    <div className={`p-2 rounded-lg shrink-0 ${notif.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{notif.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-2 block">{notif.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 text-center border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
              <span className="text-sm text-resurva-dark-light font-medium">Tandai semua sudah dibaca</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
