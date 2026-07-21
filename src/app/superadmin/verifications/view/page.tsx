"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocumentPreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const url = searchParams.get("url");
  const label = searchParams.get("label") || "Dokumen Legalitas";

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError("URL dokumen tidak valid.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.blob();
      })
      .then((blob) => {
        // Force browser to display inline by overriding content type
        let forcedType = blob.type;
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.endsWith(".pdf")) {
          forcedType = "application/pdf";
        } else if (lowerUrl.endsWith(".png")) {
          forcedType = "image/png";
        } else if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg")) {
          forcedType = "image/jpeg";
        }

        const newBlob = new Blob([blob], { type: forcedType });
        const localUrl = URL.createObjectURL(newBlob);
        setBlobUrl(localUrl);
      })
      .catch((err) => {
        console.error("Error loading document:", err);
        setError("Gagal memuat dokumen dari storage. Pastikan server backend dan MinIO aktif.");
      })
      .finally(() => {
        setLoading(false);
      });

    // Cleanup object URL on unmount
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [url]);

  const isPdf = url?.toLowerCase().endsWith(".pdf");

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col">
      {/* Header Panel */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-resurva-dark" />
            <h1 className="text-base font-bold text-slate-800">{label}</h1>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 flex items-center justify-center overflow-auto">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-slate-500 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-resurva-dark" />
            <span className="font-semibold text-sm">Menyiapkan pratinjau dokumen...</span>
          </div>
        )}

        {error && (
          <div className="max-w-md bg-white border border-rose-100 rounded-3xl p-8 text-center shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-2 text-rose-500">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Pratinjau Gagal</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{error}</p>
            <Button 
              onClick={() => router.back()}
              className="w-full bg-[#0F3D2E] hover:bg-[#1A5C44] text-white rounded-xl py-3 font-bold"
            >
              Kembali
            </Button>
          </div>
        )}

        {blobUrl && !loading && !error && (
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden flex flex-col p-4 animate-in fade-in duration-300">
            {isPdf ? (
              <iframe 
                src={blobUrl} 
                className="w-full h-[80vh] rounded-2xl border border-slate-100" 
                title={label}
              />
            ) : (
              <div className="flex items-center justify-center p-4 bg-slate-50 rounded-2xl overflow-hidden min-h-[50vh]">
                <img 
                  src={blobUrl} 
                  alt={label} 
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-sm"
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
