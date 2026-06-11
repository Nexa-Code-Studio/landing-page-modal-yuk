"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperadminPartnersPage() {
  const [partners, setPartners] = useState([
    { id: "M-001", name: "Cabang Jakarta Pusat", type: "Cabang Internal", status: "Aktif", joinDate: "2025-01-15" },
    { id: "M-002", name: "Cabang Surabaya", type: "Cabang Internal", status: "Aktif", joinDate: "2025-02-20" },
    { id: "M-003", name: "Cabang Malang", type: "Cabang Internal", status: "Aktif", joinDate: "2025-03-10" },
    { id: "M-004", name: "Cabang Bandung", type: "Cabang Internal", status: "Aktif", joinDate: "2025-04-05" },
    { id: "M-005", name: "Toko Roti Berkah", type: "Mitra Eksternal (UMKM)", status: "Menunggu Persetujuan", joinDate: "2026-06-10" },
  ]);

  const handleApprove = (id: string) => {
    setPartners((prev) => 
      prev.map((p) => p.id === id ? { ...p, status: "Aktif" } : p)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Manajemen Mitra & Cabang</h2>
          <p className="text-slate-500">
            Kelola akses sistem untuk seluruh cabang internal dan setujui pendaftaran mitra UMKM eksternal.
          </p>
        </div>
        <Button className="bg-red-700 hover:bg-red-800 text-white">
          + Daftarkan Mitra Manual
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-24">ID Mitra</TableHead>
              <TableHead>Nama Mitra/Cabang</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Tanggal Bergabung</TableHead>
              <TableHead>Status Akses</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((partner) => (
              <TableRow key={partner.id}>
                <TableCell className="font-medium text-slate-600">{partner.id}</TableCell>
                <TableCell className="font-semibold text-slate-900">{partner.name}</TableCell>
                <TableCell>{partner.type}</TableCell>
                <TableCell>{partner.joinDate}</TableCell>
                <TableCell>
                  {partner.status === "Aktif" ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-transparent">Aktif</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-300">
                      {partner.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {partner.status === "Menunggu Persetujuan" ? (
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(partner.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Setujui
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                      Nonaktifkan
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
