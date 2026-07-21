"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, Package, AlertTriangle, Truck, Menu } from "lucide-react";
import { useLanguage } from "@/lib/contexts/LanguageContext";


const TRANSLATIONS = {
  en: {
    notificationsTitle: "Notifications",
    newBadge: "New",
    markAllRead: "Mark all as read",
    notif1Title: "Product Nearing Expiry",
    notif1Msg: "Chocolate Bread has 12 hrs left, categorised as Flash Sale.",
    notif1Time: "Just now",
    notif2Title: "New Order Received",
    notif2Msg: "Budi Santoso ordered 2x Chocolate Bread (ORD-001).",
    notif2Time: "5 mins ago",
    notif3Title: "Courier Heading to Outlet",
    notif3Msg: "Biteship courier is heading to your outlet for ORD-002.",
    notif3Time: "15 mins ago",
  },
  id: {
    notificationsTitle: "Notifikasi",
    newBadge: "Baru",
    markAllRead: "Tandai semua sudah dibaca",
    notif1Title: "Produk Mendekati Kedaluwarsa",
    notif1Msg: "Roti Cokelat sisa 12 jam, masuk kategori Flash Sale.",
    notif1Time: "Baru saja",
    notif2Title: "Pesanan Baru Masuk",
    notif2Msg: "Budi Santoso memesan 2x Roti Cokelat (ORD-001).",
    notif2Time: "5 mnt lalu",
    notif3Title: "Kurir Menuju Outlet",
    notif3Msg: "Kurir Biteship sedang menuju ke outlet Anda untuk ORD-002.",
    notif3Time: "15 mnt lalu",
  }
};

interface SharedHeaderProps {
  pageTitleMapping: Record<string, string>;
  defaultTitle: string;
  onToggleSidebar?: () => void;
}

export function SharedHeader({ pageTitleMapping, defaultTitle, onToggleSidebar }: SharedHeaderProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { lang, toggleLanguage } = useLanguage();

  const t = TRANSLATIONS[lang];

  const mockNotifications = [
    { id: 1, type: "flash-sale", title: t.notif1Title, message: t.notif1Msg, time: t.notif1Time, icon: AlertTriangle, color: "text-red-500 bg-red-100" },
    { id: 2, type: "order", title: t.notif2Title, message: t.notif2Msg, time: t.notif2Time, icon: Package, color: "text-blue-500 bg-blue-100" },
    { id: 3, type: "courier", title: t.notif3Title, message: t.notif3Msg, time: t.notif3Time, icon: Truck, color: "text-purple-500 bg-purple-100" }
  ];

  const [unreadCount, setUnreadCount] = useState(mockNotifications.length);

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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="flex items-center gap-3 md:gap-4">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg md:text-xl font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-none">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4 relative" ref={dropdownRef}>
        {/* Language Switcher */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2m0-4.5A2.5 2.5 0 0119 5.5v.5a2 2 0 01-2 2h-2M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
          <span>{lang.toUpperCase()}</span>
        </button>

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
              <h3 className="font-semibold text-slate-800">{t.notificationsTitle}</h3>
              <span className="text-xs text-resurva-dark-light bg-resurva-green-muted px-2 py-1 rounded-full font-medium">{t.newBadge}</span>
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
              <span className="text-sm text-resurva-dark-light font-medium">{t.markAllRead}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
