"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Partner {
  id: string;
  name: string;
  branch: string;
  contact: string;
  joinDate: string;
  status: "Aktif" | "Nonaktif" | "Menunggu";
  monthlyRevenue: number;
  foodSavedKg: number;
}

const mockPartners: Partner[] = [
  { id: "M-001", name: "Toko Roti Berkah", branch: "Malang", contact: "0812-3456-7890", joinDate: "2025-01-15", status: "Aktif", monthlyRevenue: 4200000, foodSavedKg: 350 },
  { id: "M-002", name: "Warung Bu Sari", branch: "Surabaya", contact: "0813-2345-6789", joinDate: "2025-02-20", status: "Aktif", monthlyRevenue: 5600000, foodSavedKg: 420 },
  { id: "M-003", name: "Kafe Malino", branch: "Jakarta", contact: "0811-3456-7891", joinDate: "2025-03-10", status: "Aktif", monthlyRevenue: 11000000, foodSavedKg: 800 },
  { id: "M-004", name: "Resto Sunda Asri", branch: "Bandung", contact: "0815-4567-8901", joinDate: "2025-04-05", status: "Aktif", monthlyRevenue: 3800000, foodSavedKg: 290 },
  { id: "M-005", name: "Kedai Mas Bro", branch: "Malang", contact: "0816-5678-9012", joinDate: "2026-06-10", status: "Menunggu", monthlyRevenue: 0, foodSavedKg: 0 },
];

export default function EnterprisePartnersPage() {
  const [partners, setPartners] = useState<Partner[]>(mockPartners);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", branch: "", contact: "", joinDate: "" });
  const [search, setSearch] = useState("");

  const filtered = partners.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.branch.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = partners.filter(p => p.status === "Aktif").reduce((s, p) => s + p.monthlyRevenue, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.branch) return;
    const newPartner: Partner = {
      id: `M-${String(partners.length + 1).padStart(3, "0")}`,
      name: form.name,
      branch: form.branch,
      contact: form.contact,
      joinDate: form.joinDate || new Date().toISOString().split("T")[0],
      status: "Menunggu",
      monthlyRevenue: 0,
      foodSavedKg: 0,
    };
    setPartners(prev => [newPartner, ...prev]);
    setForm({ name: "", branch: "", contact: "", joinDate: "" });
    setShowForm(false);
  };

  const handleDelete = (id: string) => setPartners(prev => prev.filter(p => p.id !== id));

  const handleActivate = (id: string) =>
    setPartners(prev => prev.map(p => p.id === id ? { ...p, status: "Aktif" } : p));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Manajemen Mitra</h2>
          <p className="text-slate-500">Kelola seluruh mitra UMKM yang tergabung dalam ekosistem RESURVA.</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)} className="bg-green-700 hover:bg-green-800 text-white">
          {showForm ? "Tutup Form" : "+ Tambah Mitra Baru"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Mitra", value: partners.length },
          { label: "Mitra Aktif", value: partners.filter(p => p.status === "Aktif").length },
          { label: "Menunggu Verifikasi", value: partners.filter(p => p.status === "Menunggu").length },
          { label: "Total Pendapatan/Bulan", value: `Rp ${(totalRevenue / 1_000_000).toFixed(1)}Jt` },
        ].map(c => (
          <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{c.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Add Partner Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Daftarkan Mitra Baru</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-name">Nama Usaha</Label>
              <Input id="p-name" placeholder="Contoh: Toko Roti Berkah" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-branch">Kota / Cabang</Label>
              <Input id="p-branch" placeholder="Contoh: Malang" value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-contact">No. Kontak</Label>
              <Input id="p-contact" placeholder="0812-xxxx-xxxx" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-date">Tanggal Bergabung</Label>
              <Input id="p-date" type="date" value={form.joinDate} onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
              <Button type="submit" className="bg-green-700 hover:bg-green-800 text-white">Simpan Mitra</Button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div>
        <Input
          placeholder="Cari mitra atau kota..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nama Mitra</TableHead>
              <TableHead>Kota</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead className="text-right">Pendapatan / Bulan</TableHead>
              <TableHead className="text-right">Makanan Diselamatkan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-slate-500 py-8">Tidak ada mitra ditemukan.</TableCell></TableRow>
            )}
            {filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell className="text-slate-500 font-mono text-sm">{p.id}</TableCell>
                <TableCell className="font-semibold text-slate-900">{p.name}</TableCell>
                <TableCell>{p.branch}</TableCell>
                <TableCell>{p.contact}</TableCell>
                <TableCell className="text-right font-medium text-emerald-700">
                  {p.monthlyRevenue > 0 ? `Rp ${p.monthlyRevenue.toLocaleString("id-ID")}` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {p.foodSavedKg > 0 ? `${p.foodSavedKg} Kg` : "—"}
                </TableCell>
                <TableCell>
                  {p.status === "Aktif" && <Badge className="bg-green-100 text-green-800 border-transparent hover:bg-green-200">Aktif</Badge>}
                  {p.status === "Menunggu" && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">Menunggu</Badge>}
                  {p.status === "Nonaktif" && <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Nonaktif</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {p.status === "Menunggu" && (
                      <Button size="sm" onClick={() => handleActivate(p.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">Setujui</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleDelete(p.id)} className="text-red-600 border-red-200 hover:bg-red-50 text-xs">Hapus</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
