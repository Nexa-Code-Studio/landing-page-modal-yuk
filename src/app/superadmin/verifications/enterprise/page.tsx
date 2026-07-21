"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, XCircle, Eye, X, MapPin, FileText, Users, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";

const getAbsoluteDocUrl = (url: string) => {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `http://localhost:9000/resurva-bucket/stores/${url}`;
};

const getDocLabel = (url: string, index: number, type: "merchant" | "enterprise") => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("ktp")) return "KTP Pemilik";
  if (lowerUrl.includes("akta")) return "Akta Pendirian PT";
  if (lowerUrl.includes("npwp")) return "NPWP Perusahaan";
  if (lowerUrl.includes("nib")) {
    return type === "merchant" ? "NIB Toko" : "NIB Perusahaan";
  }
  if (type === "merchant") {
    return index === 0 ? "KTP Pemilik" : "NIB Toko";
  } else {
    if (index === 0) return "Akta Pendirian PT";
    if (index === 1) return "NIB Perusahaan";
    return "NPWP Perusahaan";
  }
};

export default function EnterpriseVerificationPage() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnterprise, setSelectedEnterprise] = useState<any>(null);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any[]>("/verifications/?partner_type=ENTERPRISE&status_filter=PENDING");
      setVerifications(data || []);
    } catch (err) {
      console.error("Gagal mengambil data verifikasi enterprise:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleAction = async (id: string, action: "Approve" | "Reject") => {
    const actionText = action === "Approve" ? "menyetujui" : "menolak";
    if (confirm(`Apakah Anda yakin ingin ${actionText} pendaftaran enterprise ini?`)) {
      try {
        await apiClient.patch(`/verifications/${id}/status`, {
          status: action === "Approve" ? "APPROVED" : "REJECTED",
          rejection_reason: action === "Reject" ? "Dokumen kurang lengkap atau tidak valid." : null
        });
        setVerifications(prev => prev.filter(v => v.id !== id));
        setSelectedEnterprise(null);
      } catch (err: any) {
        alert("Gagal memproses tindakan: " + (err.message || err));
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-slate-200/60 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-50 pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-resurva-dark" />
            Verifikasi Pendaftaran Enterprise (Multi-Cabang)
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Tinjau pengajuan akun manajemen pusat (Enterprise) yang mengelola banyak cabang.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-resurva-dark" />
                <span>Memuat data verifikasi...</span>
              </div>
            ) : (
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold">Nama Perusahaan</th>
                    <th className="px-6 py-4 font-bold">Direktur / PIC</th>
                    <th className="px-6 py-4 font-bold">Kantor Pusat</th>
                    <th className="px-6 py-4 font-bold">Estimasi Cabang</th>
                    <th className="px-6 py-4 font-bold">Tanggal Pengajuan</th>
                    <th className="px-6 py-4 font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {verifications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        Tidak ada pengajuan enterprise baru saat ini.
                      </td>
                    </tr>
                  ) : (
                    verifications.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                        <td className="px-6 py-4">{item.owner_or_director}</td>
                        <td className="px-6 py-4">{item.address}</td>
                        <td className="px-6 py-4 font-semibold text-resurva-dark">
                          {item.branch_count || 0} Cabang
                        </td>
                        <td className="px-6 py-4">{new Date(item.created_at).toLocaleDateString("id-ID")}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => setSelectedEnterprise(item)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Detail
                            </button>
                            <button 
                              onClick={() => handleAction(item.id, "Approve")}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Setuju
                            </button>
                            <button 
                              onClick={() => handleAction(item.id, "Reject")}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal Enterprise */}
      {selectedEnterprise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedEnterprise(null)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-resurva-dark" />
                Detail Pengajuan Enterprise
              </h3>
              <button onClick={() => setSelectedEnterprise(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Nama Perusahaan (Badan Hukum)</p>
                    <p className="text-base font-medium text-slate-900">{selectedEnterprise.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Direktur Utama / PIC</p>
                    <p className="text-base font-medium text-slate-900">{selectedEnterprise.owner_or_director}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Users className="w-3 h-3"/> Estimasi Cabang</p>
                    <p className="text-base font-medium text-slate-900">{selectedEnterprise.branch_count || 0} Cabang Aktif</p>
                  </div>
                  {selectedEnterprise.email && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Email Perusahaan</p>
                      <p className="text-base font-medium text-slate-900">{selectedEnterprise.email}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><MapPin className="w-3 h-3"/> Alamat Kantor Pusat</p>
                    <p className="text-base font-medium text-slate-900">{selectedEnterprise.address}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Tanggal Pengajuan</p>
                    <p className="text-base font-medium text-slate-900">{new Date(selectedEnterprise.created_at).toLocaleDateString("id-ID")}</p>
                  </div>
                  {selectedEnterprise.phone && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">No. Telepon / WhatsApp</p>
                      <p className="text-base font-medium text-slate-900">{selectedEnterprise.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><FileText className="w-3 h-3"/> Dokumen Legalitas Perusahaan</p>
                <div className="flex flex-wrap items-center gap-3">
                  {selectedEnterprise.documents && selectedEnterprise.documents.length > 0 ? (
                    selectedEnterprise.documents.map((docUrl: string, idx: number) => {
                      const docLabel = getDocLabel(docUrl, idx, "enterprise");
                      const previewUrl = `/superadmin/verifications/view?url=${encodeURIComponent(getAbsoluteDocUrl(docUrl))}&label=${encodeURIComponent(docLabel)}`;
                      return (
                        <a
                          key={idx}
                          href={previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-white border border-slate-200 rounded-lg flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-blue-600" /> {docLabel}
                        </a>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500">Tidak ada dokumen yang diunggah.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedEnterprise(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button 
                onClick={() => handleAction(selectedEnterprise.id, "Reject")}
                className="px-6 py-2.5 rounded-xl font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors cursor-pointer flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Tolak
              </button>
              <button 
                onClick={() => handleAction(selectedEnterprise.id, "Approve")}
                className="px-6 py-2.5 rounded-xl font-bold bg-resurva-dark text-white hover:bg-resurva-dark-light transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" /> Setuju & Buat Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
