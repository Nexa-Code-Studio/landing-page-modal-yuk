import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface MenuItem {
  name: string;
  href: string;
  target?: '_blank' | '_self';
  badge?: string;
}

export interface ProfileInfo {
  name: string;
  subtext: string;
  initials: string;
}

export interface SharedSidebarProps {
  roleName: string; // e.g. "Merchant", "Enterprise", "Superadmin"
  menus: MenuItem[];
  profile: ProfileInfo;
  isOpen?: boolean;
}

const SIDEBAR_TRANSLATIONS = {
  en: {
    "Dashboard": "Dashboard",
    "Kasir (POS)": "Cashier (POS)",
    "Inventaris": "Inventory",
    "Pesanan": "Orders",
    "Waste Analytics": "Waste Analytics",
    "SDG Sustainability": "SDG Sustainability",
    "Leaderboard Mitra": "Partner Leaderboard",
    "Manajemen Mitra": "Partner Management",
    "Profil": "Profile",
    "Logout": "Logout",
    "Cabang Malang": "Malang Branch",
    "Pusat Manajemen": "Management HQ",
    "Pusat Kendali": "Control Center"
  },
  id: {
    "Dashboard": "Dasbor",
    "Kasir (POS)": "Kasir (POS)",
    "Inventaris": "Inventaris",
    "Pesanan": "Pesanan",
    "Waste Analytics": "Analitik Sampah",
    "SDG Sustainability": "Keberlanjutan SDG",
    "Leaderboard Mitra": "Leaderboard Mitra",
    "Manajemen Mitra": "Manajemen Mitra",
    "Profil": "Profil",
    "Logout": "Keluar",
    "Cabang Malang": "Cabang Malang",
    "Pusat Manajemen": "Pusat Manajemen",
    "Pusat Kendali": "Pusat Kendali"
  }
};

export function SharedSidebar({ roleName, menus, profile, isOpen = true }: SharedSidebarProps) {
  const pathname = usePathname();
  const [lang, setLang] = useState<"en" | "id">("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage") as "en" | "id" | null;
    if (savedLang) {
      setLang(savedLang);
    } else {
      const systemLang = navigator.language.startsWith("id") ? "id" : "en";
      setLang(systemLang);
    }

    const handleLangChange = () => {
      const currentSaved = localStorage.getItem("preferredLanguage") as "en" | "id" | null;
      if (currentSaved) {
        setLang(currentSaved);
      }
    };
    window.addEventListener("languageChange", handleLangChange);
    return () => window.removeEventListener("languageChange", handleLangChange);
  }, []);

  const translate = (key: string) => {
    return SIDEBAR_TRANSLATIONS[lang][key as keyof typeof SIDEBAR_TRANSLATIONS["en"]] || key;
  };

  const style = {
    bg: "bg-resurva-dark",
    textActive: "text-resurva-dark",
    bgActive: "bg-resurva-gold",
    textHover: "hover:text-resurva-gold",
    bgHover: "hover:bg-resurva-dark-light",
    accentText: "text-resurva-gold",
    avatarBg: "bg-resurva-gold",
    avatarText: "text-resurva-dark",
    logoutHover: "hover:bg-red-900/50 hover:text-red-400",
  };

  return (
    <aside className={`w-64 ${style.bg} text-white flex-col border-r border-resurva-dark-light transition-all duration-300 ease-in-out z-50 fixed md:static inset-y-0 left-0 h-full ${isOpen ? "translate-x-0 flex" : "-translate-x-full md:flex md:w-0 md:overflow-hidden md:border-r-0"}`}>
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-resurva-dark-light shrink-0">
        <span className="text-xl font-extrabold text-white">
          RESURVA <span className={`font-light ${style.accentText}`}>{roleName}</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menus.map((item) => {
          // Exact match or active sub-route match
          const isActive = item.href.split("/").length > 2 
            ? pathname === item.href || pathname.startsWith(item.href + "/")
            : pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              target={item.target ?? '_self'}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
              className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive && item.target !== '_blank'
                  ? `${style.bgActive} ${style.textActive}`
                  : `text-white/80 ${style.textHover} ${style.bgHover}`
              }`}
            >
              <span>{translate(item.name)}</span>
              {item.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-resurva-gold/20 text-resurva-gold">{item.badge}</span>
              )}
              {item.target === '_blank' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile & Logout Section */}
      <div className="p-4 border-t border-resurva-dark-light flex flex-col gap-3 shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${style.avatarBg} ${style.avatarText}`}>
            {profile.initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{profile.name}</p>
            <p className="text-xs text-resurva-gold-light truncate">{translate(profile.subtext)}</p>
          </div>
        </div>
        
        {/* Logout Button */}
        <Link 
          href={`/login-${roleName.toLowerCase()}`}
          className={`flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-slate-300 rounded-md transition-colors ${style.logoutHover}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {translate("Logout")}
        </Link>
      </div>
    </aside>
  );
}
