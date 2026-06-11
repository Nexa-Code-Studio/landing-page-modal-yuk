"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface SharedHeaderProps {
  pageTitleMapping: Record<string, string>;
  defaultTitle: string;
}

export function SharedHeader({ pageTitleMapping, defaultTitle }: SharedHeaderProps) {
  const pathname = usePathname();

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
      <div className="flex items-center gap-4">
        {/* Placeholder for Notifications */}
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
