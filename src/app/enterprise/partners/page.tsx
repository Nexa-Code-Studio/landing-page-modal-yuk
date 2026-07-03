"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { Edit2, Eye, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";

const MapDisplay = dynamic(() => import("@/components/ui/MapDisplay"), { ssr: false });

export interface Partner {
  id: string;
  name: string;
  branch: string;
  contact: string;
  email: string;
  address: string;
  category: string;
  joinDate: string;
  status: "Aktif" | "Nonaktif";
  monthlyRevenue: number;
  foodSavedKg: number;
  username?: string;
  password?: string;
  latitude?: number;
  longitude?: number;
}

const mockPartners: Partner[] = [
  { id: "M-001", name: "Toko Roti Berkah", branch: "Malang", contact: "0812-3456-7890", email: "berkah@outlet.com", address: "Jl. Suhat No. 1, Malang", category: "Bakery", joinDate: "2025-01-15", status: "Aktif", monthlyRevenue: 4200000, foodSavedKg: 350, latitude: -7.940026, longitude: 112.616335 },
  { id: "M-002", name: "Warung Bu Sari", branch: "Surabaya", contact: "0813-2345-6789", email: "sari@outlet.com", address: "Jl. Tunjungan No. 5, Surabaya", category: "Resto", joinDate: "2025-02-20", status: "Aktif", monthlyRevenue: 5600000, foodSavedKg: 420, latitude: -7.260533, longitude: 112.738153 },
  { id: "M-003", name: "Kafe Malino", branch: "Jakarta", contact: "0811-3456-7891", email: "malino@outlet.com", address: "Jl. Sudirman No. 10, Jakarta", category: "Cafe", joinDate: "2025-03-10", status: "Aktif", monthlyRevenue: 11000000, foodSavedKg: 800, latitude: -6.214620, longitude: 106.815132 },
  { id: "M-004", name: "Resto Sunda Asri", branch: "Bandung", contact: "0815-4567-8901", email: "sunda@outlet.com", address: "Jl. Braga No. 2, Bandung", category: "Resto", joinDate: "2025-04-05", status: "Aktif", monthlyRevenue: 3800000, foodSavedKg: 290, latitude: -6.917464, longitude: 107.609470 },
];

export default function EnterprisePartnersPage() {
  const [partners, setPartners] = useState<Partner[]>(mockPartners);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<string | null>(null);
  
  const initialForm = { id: "", name: "", branch: "", contact: "", email: "", address: "", category: "", joinDate: "", username: "", password: "", status: "Aktif" as Partner["status"], latitude: undefined as number | undefined, longitude: undefined as number | undefined };
  const [form, setForm] = useState(initialForm);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [filterBranch, setFilterBranch] = useState("Semua");
  const [filterRevenue, setFilterRevenue] = useState("Semua");
  const [filterYear, setFilterYear] = useState("Semua");

  const uniqueCategories = Array.from(new Set(partners.map(p => p.category))).filter(Boolean);
  const uniqueBranches = Array.from(new Set(partners.map(p => p.branch))).filter(Boolean);
  const uniqueYears = Array.from(new Set(partners.map(p => p.joinDate.substring(0, 4)))).sort();

  const filtered = partners.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.branch.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "Semua" || p.status === filterStatus;
    const matchesCategory = filterCategory === "Semua" || p.category === filterCategory;
    const matchesBranch = filterBranch === "Semua" || p.branch === filterBranch;
    
    let matchesRevenue = true;
    if (filterRevenue === "< 5 Juta") matchesRevenue = p.monthlyRevenue < 5000000;
    else if (filterRevenue === "5 - 10 Juta") matchesRevenue = p.monthlyRevenue >= 5000000 && p.monthlyRevenue <= 10000000;
    else if (filterRevenue === "> 10 Juta") matchesRevenue = p.monthlyRevenue > 10000000;
    
    const matchesYear = filterYear === "Semua" || p.joinDate.startsWith(filterYear);

    return matchesSearch && matchesStatus && matchesCategory && matchesBranch && matchesRevenue && matchesYear;
  });

  const totalRevenue = partners.filter(p => p.status === "Aktif").reduce((s, p) => s + p.monthlyRevenue, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.branch || !form.username || !form.password) return;
    const newPartner: Partner = {
      ...form,
      id: `M-${String(partners.length + 1).padStart(3, "0")}`,
      joinDate: form.joinDate || new Date().toISOString().split("T")[0],
      status: "Aktif",
      monthlyRevenue: 0,
      foodSavedKg: 0,
    };
    setPartners(prev => [newPartner, ...prev]);
    setForm(initialForm);
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPartners(prev => prev.map(p => p.id === form.id ? { ...p, ...form } : p));
    setForm(initialForm);
    setShowEditModal(false);
  };

  const openEditModal = (partner: Partner) => {
    setForm({
      id: partner.id,
      name: partner.name,
      branch: partner.branch,
      contact: partner.contact,
      email: partner.email || "",
      address: partner.address || "",
      category: partner.category || "",
      joinDate: partner.joinDate,
      username: partner.username || "",
      password: partner.password || "",
      status: partner.status,
      latitude: partner.latitude,
      longitude: partner.longitude
    });
    setShowEditModal(true);
  };

  const handleGeocode = async () => {
    if (!form.address) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setForm(f => ({ ...f, latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }));
      } else {
        alert("Lokasi tidak ditemukan. Coba masukkan nama kota dan jalan yang lebih spesifik.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mencari lokasi.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const confirmDelete = () => {
    if (partnerToDelete) {
      setPartners(prev => prev.filter(p => p.id !== partnerToDelete));
      setPartnerToDelete(null);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setFilterStatus("Semua");
    setFilterCategory("Semua");
    setFilterBranch("Semua");
    setFilterRevenue("Semua");
    setFilterYear("Semua");
  };

  const renderModalForm = (isEdit = false) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-1">{isEdit ? "Edit Data Mitra" : "Daftarkan Mitra Baru"}</h3>
          <p className="text-sm text-slate-500 mb-6">{isEdit ? "Perbarui informasi profil cabang." : "Masukkan informasi outlet dan kredensial login untuk merchant."}</p>
          <form onSubmit={isEdit ? handleEditSubmit : handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-name">Nama Usaha</Label>
                <Input id="p-name" placeholder="Contoh: Toko Roti Berkah" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-category">Kategori Outlet</Label>
                <Input id="p-category" placeholder="Cafe, Resto, Bakery..." value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-branch">Kota / Cabang</Label>
                <Input id="p-branch" placeholder="Contoh: Malang" value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="p-address">Alamat Lengkap</Label>
                <div className="flex gap-2">
                  <Input id="p-address" placeholder="Jl. Raya No..." value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
                  <Button type="button" onClick={handleGeocode} disabled={!form.address || isGeocoding} className="shrink-0 bg-slate-800 hover:bg-slate-900 text-white">
                    {isGeocoding ? "Mencari..." : "Cari Titik Lokasi"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-lat">Latitude</Label>
                <Input id="p-lat" type="number" step="any" placeholder="-7.940026" value={form.latitude || ""} onChange={e => setForm(f => ({ ...f, latitude: parseFloat(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-lng">Longitude</Label>
                <Input id="p-lng" type="number" step="any" placeholder="112.616335" value={form.longitude || ""} onChange={e => setForm(f => ({ ...f, longitude: parseFloat(e.target.value) }))} />
              </div>
              {form.latitude !== undefined && form.longitude !== undefined && !isNaN(form.latitude) && !isNaN(form.longitude) && (
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-semibold text-slate-700">Pratinjau Lokasi <span className="text-slate-500 font-normal">(Geser ikon pin jika kurang presisi)</span></Label>
                  <MapDisplay 
                    latitude={form.latitude} 
                    longitude={form.longitude} 
                    name={form.name} 
                    draggable={true} 
                    onLocationChange={(lat, lng) => setForm(f => ({ ...f, latitude: lat, longitude: lng }))}
                  />
                </div>
              )}
              <div className="space-y-2 md:col-span-2">
                <hr className="my-2 border-slate-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-contact">No. Telepon / WA</Label>
                <Input id="p-contact" placeholder="0812-xxxx-xxxx" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-email">Email Bisnis</Label>
                <Input id="p-email" type="email" placeholder="contoh@outlet.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              {!isEdit && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="p-username">Username Login</Label>
                    <Input id="p-username" placeholder="roti_berkah" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-password">Password Login</Label>
                    <Input id="p-password" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                  </div>
                </>
              )}
              {isEdit && (
                <div className="space-y-2">
                  <Label>Status Kemitraan</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Partner["status"] }))}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setShowEditModal(false); setForm(initialForm); }}>Batal</Button>
              <Button type="submit" className="bg-green-700 hover:bg-green-800 text-white">{isEdit ? "Simpan Perubahan" : "Simpan Mitra"}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Manajemen Mitra</h2>
          <p className="text-slate-500">Kelola seluruh mitra UMKM yang tergabung dalam ekosistem RESURVA.</p>
        </div>
        <Button onClick={() => { setForm(initialForm); setShowAddModal(true); }} className="bg-green-700 hover:bg-green-800 text-white shadow-sm">
          + Tambah Mitra Baru
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Mitra", value: partners.length },
          { label: "Mitra Aktif", value: partners.filter(p => p.status === "Aktif").length },
          { label: "Mitra Nonaktif", value: partners.filter(p => p.status === "Nonaktif").length },
          { label: "Total Pendapatan/Bulan", value: `Rp ${(totalRevenue / 1_000_000).toFixed(1)}Jt` },
        ].map(c => (
          <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{c.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="flex-1 w-full min-w-[200px]">
            <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Pencarian</Label>
            <Input
              placeholder="Cari nama mitra atau kota..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50"
            />
          </div>
          <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
            <div className="w-[140px] flex-grow sm:flex-grow-0">
              <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Status</Label>
              <select className="w-full rounded-md border border-slate-200 h-10 px-3 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
            <div className="w-[140px] flex-grow sm:flex-grow-0">
              <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Kategori</Label>
              <select className="w-full rounded-md border border-slate-200 h-10 px-3 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="Semua">Semua Kategori</option>
                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="w-[140px] flex-grow sm:flex-grow-0">
              <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Kota / Cabang</Label>
              <select className="w-full rounded-md border border-slate-200 h-10 px-3 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
                <option value="Semua">Semua Kota</option>
                {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="w-[140px] flex-grow sm:flex-grow-0">
              <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Pendapatan</Label>
              <select className="w-full rounded-md border border-slate-200 h-10 px-3 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" value={filterRevenue} onChange={e => setFilterRevenue(e.target.value)}>
                <option value="Semua">Semua Rentang</option>
                <option value="< 5 Juta">&lt; 5 Juta</option>
                <option value="5 - 10 Juta">5 - 10 Juta</option>
                <option value="> 10 Juta">&gt; 10 Juta</option>
              </select>
            </div>
            <div className="w-[140px] flex-grow sm:flex-grow-0">
              <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Tahun Gabung</Label>
              <select className="w-full rounded-md border border-slate-200 h-10 px-3 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                <option value="Semua">Semua Tahun</option>
                {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <Button variant="ghost" onClick={resetFilters} className="text-slate-500 h-10 px-4 hover:bg-slate-100 hidden sm:flex">
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && renderModalForm(false)}
      {showEditModal && renderModalForm(true)}
      
      {/* Delete Confirmation Modal */}
      {partnerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Mitra?</h3>
              <p className="text-sm text-slate-500 mb-6">Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus mitra ini dari sistem?</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setPartnerToDelete(null)}>Batal</Button>
                <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Ya, Hapus</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Nama Mitra</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Cabang / Kota</TableHead>
              <TableHead>Kontak & Email</TableHead>
              <TableHead className="text-right">Pendapatan / Bulan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-slate-500 py-8">Tidak ada mitra ditemukan.</TableCell></TableRow>
            )}
            {filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{p.id}</div>
                </TableCell>
                <TableCell>{p.category || "-"}</TableCell>
                <TableCell>{p.branch}</TableCell>
                <TableCell>
                  <div className="text-sm">{p.contact}</div>
                  <div className="text-xs text-slate-500">{p.email || "-"}</div>
                </TableCell>
                <TableCell className="text-right font-medium text-emerald-700">
                  {p.monthlyRevenue > 0 ? `Rp ${p.monthlyRevenue.toLocaleString("id-ID")}` : "—"}
                </TableCell>
                <TableCell>
                  {p.status === "Aktif" && <Badge className="bg-green-100 text-green-800 border-transparent">Aktif</Badge>}
                  {p.status === "Nonaktif" && <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Nonaktif</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8" title="Lihat Detail">
                      <Link href={`/enterprise/partners/${p.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEditModal(p)} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-8 w-8" title="Edit Data">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setPartnerToDelete(p.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8" title="Hapus">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
