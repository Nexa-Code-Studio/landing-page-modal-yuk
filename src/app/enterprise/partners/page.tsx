"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { Edit2, Eye, Trash2, MoreVertical, Key, Loader2, Plus, Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import { apiClient, getStoredUser } from "@/lib/api";

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

export default function EnterprisePartnersPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  
  // Modals & Action States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  
  const initialForm = {
    id: "",
    name: "",
    branch: "",
    contact: "",
    email: "",
    address: "",
    category: "Bakery",
    joinDate: "",
    username: "",
    password: "",
    status: "Aktif" as Partner["status"],
    latitude: -7.940026 as number | undefined,
    longitude: 112.616335 as number | undefined
  };

  const [form, setForm] = useState(initialForm);
  const [resetPartner, setResetPartner] = useState<Partner | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [filterBranch, setFilterBranch] = useState("Semua");
  const [filterRevenue, setFilterRevenue] = useState("Semua");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Resolve Business Context
  useEffect(() => {
    async function initBusiness() {
      const user = getStoredUser();
      if (user?.business_id) {
        setBusinessId(user.business_id);
        return;
      }
      try {
        const businesses = await apiClient.get<any[]>("/business");
        if (businesses && businesses.length > 0) {
          setBusinessId(businesses[0].id);
        }
      } catch (err) {
        console.warn("Failed to load business context:", err);
      }
    }
    initBusiness();
  }, []);

  // Fetch Stores from Backend API
  const fetchStores = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get<any>(`/stores?business_id=${businessId}&page_size=100`);
      const rawStores = res?.items || res || [];

      const mapped: Partner[] = rawStores.map((s: any) => {
        const d = s.created_at ? new Date(s.created_at) : new Date();
        const joinDateStr = d.toISOString().split("T")[0];
        return {
          id: s.id,
          name: s.name,
          branch: s.city || "Pusat",
          contact: s.contact || s.business?.phone || "—",
          email: s.email || s.business?.email || "—",
          address: s.address || "",
          category: s.category || (s.store_category?.name) || "F&B",
          joinDate: joinDateStr,
          status: s.is_active ? "Aktif" : "Nonaktif",
          monthlyRevenue: s.monthly_revenue || 0,
          foodSavedKg: s.eco_impact_saved_meals || 0,
          latitude: s.latitude,
          longitude: s.longitude
        };
      });

      setPartners(mapped);
    } catch (err) {
      console.warn("Error fetching store partners:", err);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Unique Filter Options
  const uniqueCategories = Array.from(new Set(partners.map(p => p.category))).filter(Boolean);
  const uniqueBranches = Array.from(new Set(partners.map(p => p.branch))).filter(Boolean);

  const filtered = partners.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.branch.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "Semua" || p.status === filterStatus;
    const matchesCategory = filterCategory === "Semua" || p.category === filterCategory;
    const matchesBranch = filterBranch === "Semua" || p.branch === filterBranch;
    
    let matchesRevenue = true;
    if (filterRevenue === "< 5 Juta") matchesRevenue = p.monthlyRevenue < 5000000;
    else if (filterRevenue === "5 - 10 Juta") matchesRevenue = p.monthlyRevenue >= 5000000 && p.monthlyRevenue <= 10000000;
    else if (filterRevenue === "> 10 Juta") matchesRevenue = p.monthlyRevenue > 10000000;

    return matchesSearch && matchesStatus && matchesCategory && matchesBranch && matchesRevenue;
  });

  const totalRevenue = partners.filter(p => p.status === "Aktif").reduce((s, p) => s + p.monthlyRevenue, 0);

  // Add Partner Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.branch || !businessId) return;
    setSubmitting(true);
    try {
      await apiClient.post("/stores", {
        name: form.name,
        address: form.address || "Jl. Raya",
        city: form.branch,
        longitude: form.longitude || 112.616335,
        latitude: form.latitude || -7.940026,
        business_id: businessId,
        category: form.category,
        is_active: true,
        username: form.username || undefined,
        password: form.password || undefined,
        email: form.email || undefined,
        contact: form.contact || undefined
      });

      setShowAddModal(false);
      setForm(initialForm);
      fetchStores();
    } catch (err: any) {
      alert(`Gagal mendaftarkan mitra: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Partner Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id) return;
    setSubmitting(true);
    try {
      await apiClient.put(`/stores/${form.id}`, {
        name: form.name,
        city: form.branch,
        address: form.address,
        category: form.category,
        is_active: form.status === "Aktif",
        latitude: form.latitude,
        longitude: form.longitude
      });

      setShowEditModal(false);
      setForm(initialForm);
      fetchStores();
    } catch (err: any) {
      alert(`Gagal memperbarui mitra: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPartner || !newPassword) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/stores/${resetPartner.id}/reset-seller-password`, {
        new_password: newPassword
      });

      alert(`Password untuk merchant "${resetPartner.name}" telah berhasil diperbarui.`);
      setShowResetModal(false);
      setResetPartner(null);
      setNewPassword("");
    } catch (err: any) {
      alert(`Gagal mereset password: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete/Deactivate Partner
  const confirmDelete = async () => {
    if (!partnerToDelete) return;
    setSubmitting(true);
    try {
      await apiClient.delete(`/stores/${partnerToDelete.id}`);
      setPartnerToDelete(null);
      fetchStores();
    } catch (err: any) {
      alert(`Gagal menonaktifkan mitra: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (partner: Partner) => {
    setForm({
      id: partner.id,
      name: partner.name,
      branch: partner.branch,
      contact: partner.contact === "—" ? "" : partner.contact,
      email: partner.email === "—" ? "" : partner.email,
      address: partner.address,
      category: partner.category,
      joinDate: partner.joinDate,
      username: "",
      password: "",
      status: partner.status,
      latitude: partner.latitude,
      longitude: partner.longitude
    });
    setActiveDropdownId(null);
    setShowEditModal(true);
  };

  const openResetModal = (partner: Partner) => {
    setResetPartner(partner);
    setNewPassword("");
    setActiveDropdownId(null);
    setShowResetModal(true);
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
      alert("Terjadi kesalahan saat mencari titik lokasi.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setFilterStatus("Semua");
    setFilterCategory("Semua");
    setFilterBranch("Semua");
    setFilterRevenue("Semua");
  };

  const renderModalForm = (isEdit = false) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-6 flex flex-col min-h-0 h-full">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{isEdit ? "Edit Data Mitra" : "Daftarkan Mitra Baru"}</h3>
              <p className="text-sm text-slate-500">{isEdit ? "Perbarui informasi profil cabang toko." : "Masukkan informasi outlet dan kredensial login untuk merchant."}</p>
            </div>
            <button onClick={() => { setShowAddModal(false); setShowEditModal(false); setForm(initialForm); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={isEdit ? handleEditSubmit : handleAddSubmit} className="flex-grow flex flex-col min-h-0">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="p-name">Nama Usaha / Toko</Label>
                  <Input id="p-name" placeholder="Contoh: Toko Roti Berkah" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-category">Kategori Outlet</Label>
                  <Input id="p-category" placeholder="Bakery, Resto, Cafe..." value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-branch">Kota / Cabang</Label>
                  <Input id="p-branch" placeholder="Contoh: Malang" value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="p-address">Alamat Lengkap</Label>
                  <div className="flex gap-2">
                    <Input id="p-address" placeholder="Jl. Raya No. 1..." value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
                    <Button type="button" onClick={handleGeocode} disabled={!form.address || isGeocoding} className="shrink-0 bg-slate-800 hover:bg-slate-900 text-white cursor-pointer">
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
                    <Label className="text-sm font-semibold text-slate-700">Pratinjau Lokasi Peta</Label>
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
                  <Label htmlFor="p-contact">No. Telepon / WA Merchant</Label>
                  <Input id="p-contact" placeholder="0812xxxxxxxx" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-email">Email Merchant</Label>
                  <Input id="p-email" type="email" placeholder="berkah@outlet.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>

                {!isEdit && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="p-username">Username Login Merchant</Label>
                      <Input id="p-username" placeholder="roti_berkah" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p-password">Password Login Merchant</Label>
                      <Input id="p-password" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                    </div>
                  </>
                )}

                {isEdit && (
                  <div className="space-y-2">
                    <Label>Status Kemitraan</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value as Partner["status"] }))}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-100 shrink-0">
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setShowEditModal(false); setForm(initialForm); }} className="cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="bg-resurva-dark hover:bg-resurva-dark-light text-white font-bold cursor-pointer">
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {isEdit ? "Simpan Perubahan" : "Daftarkan Mitra & Akun Merchant"}
              </Button>
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Manajemen Mitra
            {loading && <Loader2 className="w-5 h-5 animate-spin text-resurva-dark" />}
          </h2>
          <p className="text-slate-500 mt-1">Kelola seluruh cabang toko & mitra merchant yang dinaungi oleh Enterprise.</p>
        </div>
        <Button onClick={() => { setForm(initialForm); setShowAddModal(true); }} className="bg-resurva-dark hover:bg-resurva-dark-light text-white font-bold shadow-sm cursor-pointer">
          <Plus className="w-4 h-4 mr-1" /> Tambah Mitra Baru
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Mitra", value: loading ? "..." : partners.length },
          { label: "Mitra Aktif", value: loading ? "..." : partners.filter(p => p.status === "Aktif").length },
          { label: "Mitra Nonaktif", value: loading ? "..." : partners.filter(p => p.status === "Nonaktif").length },
          { label: "Total Omset/Bulan", value: loading ? "..." : `Rp ${totalRevenue.toLocaleString("id-ID")}` },
        ].map(c => (
          <div key={c.label} className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{c.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="flex-1 w-full min-w-[200px]">
            <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Pencarian</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari nama mitra atau kota..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
            <div className="w-[140px] flex-grow sm:flex-grow-0">
              <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Status</Label>
              <select className="w-full rounded-md border border-slate-200 h-10 px-3 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
            <div className="w-[140px] flex-grow sm:flex-grow-0">
              <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Kategori</Label>
              <select className="w-full rounded-md border border-slate-200 h-10 px-3 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="Semua">Semua Kategori</option>
                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="w-[140px] flex-grow sm:flex-grow-0">
              <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Kota / Cabang</Label>
              <select className="w-full rounded-md border border-slate-200 h-10 px-3 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900" value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
                <option value="Semua">Semua Kota</option>
                {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="w-[140px] flex-grow sm:flex-grow-0">
              <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Pendapatan</Label>
              <select className="w-full rounded-md border border-slate-200 h-10 px-3 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900" value={filterRevenue} onChange={e => setFilterRevenue(e.target.value)}>
                <option value="Semua">Semua Rentang</option>
                <option value="< 5 Juta">&lt; 5 Juta</option>
                <option value="5 - 10 Juta">5 - 10 Juta</option>
                <option value="> 10 Juta">&gt; 10 Juta</option>
              </select>
            </div>
            <Button variant="ghost" onClick={resetFilters} className="text-slate-500 h-10 px-4 hover:bg-slate-100 cursor-pointer">
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && renderModalForm(false)}
      {showEditModal && renderModalForm(true)}

      {/* Reset Password Modal */}
      {showResetModal && resetPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                Reset Password Merchant
              </h3>
              <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Masukkan password baru untuk akun merchant toko <span className="font-bold text-slate-900">{resetPartner.name}</span>.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="reset-pass">Password Baru</Label>
                <Input 
                  id="reset-pass" 
                  type="password" 
                  required 
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setShowResetModal(false)} className="cursor-pointer">
                  Batal
                </Button>
                <Button type="submit" disabled={submitting || !newPassword} className="bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Simpan Password Baru
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {partnerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Nonaktifkan Mitra?</h3>
              <p className="text-sm text-slate-500 mb-6">Status mitra <span className="font-bold text-slate-800">{partnerToDelete.name}</span> akan diubah menjadi Nonaktif. Riwayat transaksi historis tetap tersimpan.</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setPartnerToDelete(null)} className="cursor-pointer">Batal</Button>
                <Button onClick={confirmDelete} disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white cursor-pointer font-bold">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Ya, Nonaktifkan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm relative">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Nama Mitra / Outlet</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Cabang / Kota</TableHead>
              <TableHead>Kontak & Email</TableHead>
              <TableHead className="text-right">Omset (30 Hari)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center w-16">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-slate-500 py-8">{loading ? "Memuat data mitra..." : "Tidak ada mitra ditemukan."}</TableCell></TableRow>
            )}
            {filtered.map(p => (
              <TableRow key={p.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{p.id.substring(0, 8)}...</div>
                </TableCell>
                <TableCell>{p.category || "—"}</TableCell>
                <TableCell>{p.branch}</TableCell>
                <TableCell>
                  <div className="text-sm">{p.contact}</div>
                  <div className="text-xs text-slate-500">{p.email}</div>
                </TableCell>
                <TableCell className="text-right font-bold text-emerald-600">
                  {p.monthlyRevenue > 0 ? `Rp ${p.monthlyRevenue.toLocaleString("id-ID")}` : "Rp 0"}
                </TableCell>
                <TableCell>
                  {p.status === "Aktif" && <Badge className="bg-emerald-100 text-emerald-800 border-transparent font-semibold">Aktif</Badge>}
                  {p.status === "Nonaktif" && <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 font-semibold">Nonaktif</Badge>}
                </TableCell>
                <TableCell className="text-center relative">
                  {/* Single 3-Dots Action Button */}
                  <div className="relative inline-block text-left" ref={activeDropdownId === p.id ? dropdownRef : null}>
                    <button
                      onClick={() => setActiveDropdownId(activeDropdownId === p.id ? null : p.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Aksi Mitra"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* High Z-Index Floating Dropdown Menu */}
                    {activeDropdownId === p.id && (
                      <div className="fixed right-12 mt-1 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                        <Link
                          href={`/enterprise/partners/${p.id}`}
                          onClick={() => setActiveDropdownId(null)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                        >
                          <Eye className="w-4 h-4 text-blue-600" /> Lihat Detail
                        </Link>
                        
                        <button
                          onClick={() => openEditModal(p)}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium text-left cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4 text-amber-600" /> Edit Data
                        </button>

                        <button
                          onClick={() => openResetModal(p)}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium text-left cursor-pointer"
                        >
                          <Key className="w-4 h-4 text-amber-500" /> Reset Password
                        </button>

                        <hr className="my-1 border-slate-100" />

                        <button
                          onClick={() => { setPartnerToDelete(p); setActiveDropdownId(null); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium text-left cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" /> Nonaktifkan
                        </button>
                      </div>
                    )}
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
