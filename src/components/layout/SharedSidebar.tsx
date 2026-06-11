"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface MenuItem {
  name: string;
  href: string;
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
}

export function SharedSidebar({ roleName, menus, profile }: SharedSidebarProps) {
  const pathname = usePathname();

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
    <aside className={`w-64 ${style.bg} text-white hidden md:flex flex-col border-r border-resurva-dark-light`}>
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-resurva-dark-light">
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
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? `${style.bgActive} ${style.textActive}`
                  : `text-white ${style.textHover} ${style.bgHover}`
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Profile & Logout Section */}
      <div className="p-4 border-t border-resurva-dark-light flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${style.avatarBg} ${style.avatarText}`}>
            {profile.initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{profile.name}</p>
            <p className="text-xs text-resurva-gold-light truncate">{profile.subtext}</p>
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
          Logout
        </Link>
      </div>
    </aside>
  );
}
