"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, Search, Monitor, Smartphone, AlertCircle, Info, AlertTriangle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function SystemLogsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Debounce search term to avoid spamming the backend API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [platformFilter, severityFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("page_size", pageSize.toString());
      
      if (platformFilter !== "all") {
        params.append("platform", platformFilter);
      }
      if (severityFilter !== "all") {
        params.append("severity", severityFilter.toUpperCase());
      }
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      const response = await apiClient.get<any>(`/logs/?${params.toString()}`);
      
      setLogs(response.items || []);
      if (response.pagination) {
        setTotalPages(response.pagination.total_pages || 1);
        setTotalItems(response.pagination.total || 0);
      }
    } catch (err) {
      console.error("Gagal mengambil data log sistem:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, platformFilter, severityFilter, debouncedSearch]);

  const getSeverityIcon = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "INFO": return <Info className="w-4 h-4 text-blue-500" />;
      case "WARNING": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "ERROR": return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default: return null;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "ERROR": return "text-rose-600";
      case "WARNING": return "text-amber-600";
      default: return "text-blue-600";
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case "mobile_client": return "Mobile Client";
      case "web_merchant": return "Web Merchant";
      case "web_enterprise": return "Web Enterprise";
      case "web_superadmin": return "Web Superadmin";
      case "system": return "System";
      default: return platform;
    }
  };

  const getPlatformIcon = (platform: string) => {
    if (platform.startsWith("web")) return <Monitor className="w-4 h-4 text-slate-500" />;
    if (platform === "mobile_client") return <Smartphone className="w-4 h-4 text-slate-500" />;
    return <Monitor className="w-4 h-4 text-slate-500" />;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-slate-200/60 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-50 pb-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-resurva-dark" />
                Riwayat Log Sistem Terpadu
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Pantau seluruh aktivitas dari aplikasi Web Dashboard, Mobile Kasir, dan Mobile Pelanggan.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari event atau user..." 
                  className="pl-9 w-full h-10 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-resurva-dark transition-colors"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <select 
                className="h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-resurva-dark text-slate-600"
                value={platformFilter}
                onChange={e => setPlatformFilter(e.target.value)}
              >
                <option value="all">Semua Platform</option>
                <option value="mobile_client">Mobile Client</option>
                <option value="web_merchant">Web Merchant</option>
                <option value="web_enterprise">Web Enterprise</option>
                <option value="web_superadmin">Web Superadmin</option>
                <option value="system">System</option>
              </select>

              <select 
                className="h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-resurva-dark text-slate-600"
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
              >
                <option value="all">Semua Tingkat</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 font-mono">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-sans">
                <tr>
                  <th className="px-6 py-4 font-bold">Waktu (Timestamp)</th>
                  <th className="px-6 py-4 font-bold">Tingkat</th>
                  <th className="px-6 py-4 font-bold">Sumber Platform</th>
                  <th className="px-6 py-4 font-bold">Event / Aktivitas</th>
                  <th className="px-6 py-4 font-bold">User & IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-sans">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-resurva-dark" />
                        Memuat data log...
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-sans">
                      Tidak ada log yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatTimestamp(log.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {getSeverityIcon(log.severity)}
                          <span className={`text-xs font-bold ${getSeverityClass(log.severity)}`}>
                            {log.severity.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700 whitespace-nowrap">
                          {getPlatformIcon(log.platform)}
                          {getPlatformLabel(log.platform)}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div>{log.event}</div>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="text-xs text-slate-400 font-sans mt-1 bg-slate-50 p-1.5 rounded border border-slate-100 max-w-lg overflow-x-auto">
                            {JSON.stringify(log.details)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-slate-800">{log.user_email || "System"}</span>
                          <span className="text-xs text-slate-400">{log.ip_address || "-"}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-xl font-sans">
            <span className="text-sm text-slate-500">
              Menampilkan {logs.length} dari {totalItems} entri log
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-sm font-medium text-slate-700">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
