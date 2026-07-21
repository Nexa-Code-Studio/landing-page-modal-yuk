"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Edit2, Trash2, Shield, X, CheckCircle2, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function UsersManagementPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({ id: "", name: "", email: "", role: "Merchant", status: "Active" });

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case "customer": return "Customer";
      case "seller": return "Merchant";
      case "owner": return "Enterprise";
      case "admin": return "Superadmin";
      default: return role;
    }
  };

  const getBackendRole = (label: string) => {
    switch (label) {
      case "Customer": return "customer";
      case "Merchant": return "seller";
      case "Enterprise": return "owner";
      case "Superadmin": return "admin";
      default: return label.toLowerCase();
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any>("/users/?page_size=100");
      const mapped = (data.items || []).map((u: any) => ({
        id: u.id,
        name: u.username,
        email: u.email,
        role: getRoleLabel(u.role),
        status: u.is_active ? "Active" : "Suspended",
        joinedAt: new Date(u.created_at).toLocaleDateString("id-ID")
      }));
      setUsers(mapped);
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setFormData(user);
      setIsEditMode(true);
    } else {
      setFormData({ id: "", name: "", email: "", role: "Merchant", status: "Active" });
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditMode) {
        // Edit User
        const payload = {
          username: formData.name,
          email: formData.email,
          role: getBackendRole(formData.role),
          is_active: formData.status === "Active"
        };
        await apiClient.patch(`/users/${formData.id}`, payload);
      } else {
        // Add User
        const payload = {
          username: formData.name,
          email: formData.email,
          role: getBackendRole(formData.role),
          is_active: formData.status === "Active",
          password: "password123" // Default password
        };
        await apiClient.post("/users/", payload);
      }
      setIsModalOpen(false);
      await fetchUsers();
    } catch (err: any) {
      alert("Gagal menyimpan pengguna: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menangguhkan (Suspend) pengguna "${name}"?`)) {
      try {
        await apiClient.patch(`/users/${id}`, { is_active: false });
        await fetchUsers();
      } catch (err: any) {
        alert("Gagal menonaktifkan pengguna: " + (err.message || err));
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Pengguna</h1>
          <p className="text-slate-500 mt-1">Kelola akses, perbarui informasi, dan pantau seluruh pengguna aplikasi.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#0F3D2E] hover:bg-[#16523F] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer self-end sm:self-center shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </button>
      </div>

      <Card className="border-slate-200/60 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-50 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2 shrink-0">
              <Shield className="w-5 h-5 text-[#0F3D2E]" />
              Daftar Pengguna Aplikasi
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama atau email..." 
                  className="pl-9 w-full h-10 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F3D2E] transition-colors"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 w-full sm:w-auto justify-center sm:justify-start">
                <button
                  onClick={() => setRoleFilter("all")}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${roleFilter === "all" ? "bg-white text-[#0F3D2E] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >Semua</button>
                <button
                  onClick={() => setRoleFilter("merchant")}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${roleFilter === "merchant" ? "bg-white text-[#0F3D2E] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >Merchant</button>
                <button
                  onClick={() => setRoleFilter("enterprise")}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${roleFilter === "enterprise" ? "bg-white text-[#0F3D2E] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >Enterprise</button>
                <button
                  onClick={() => setRoleFilter("customer")}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${roleFilter === "customer" ? "bg-white text-[#0F3D2E] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >Customer</button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-[#0F3D2E]" />
                <span className="font-semibold text-sm">Memuat data pengguna...</span>
              </div>
            ) : (
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-white uppercase bg-[#0F3D2E]">
                  <tr>
                    <th className="px-6 py-4 font-bold">Nama Pengguna</th>
                    <th className="px-6 py-4 font-bold">Email</th>
                    <th className="px-6 py-4 font-bold">Peran (Role)</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Tanggal Bergabung</th>
                    <th className="px-6 py-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        Tidak ada pengguna yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            user.role === 'Superadmin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'Enterprise' ? 'bg-blue-100 text-blue-700' :
                            user.role === 'Merchant' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                            user.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{user.joinedAt}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleOpenModal(user)}
                              className="p-1.5 text-slate-400 hover:text-[#0F3D2E] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(user.id, user.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
            
            {/* Pagination Controls */}
            {!loading && filteredUsers.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                <div className="text-xs font-semibold text-slate-500">
                  Menampilkan {Math.min(filteredUsers.length, (currentPage - 1) * pageSize + 1)} - {Math.min(filteredUsers.length, currentPage * pageSize)} dari {filteredUsers.length} pengguna
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const p = idx + 1;
                      if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
                        return (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              currentPage === p 
                                ? "bg-[#0F3D2E] text-white shadow-sm" 
                                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      }
                      if (p === 2 || p === totalPages - 1) {
                        return <span key={p} className="text-slate-400 text-xs px-1">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">{isEditMode ? "Edit Pengguna" : "Tambah Pengguna Baru"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Lengkap / Username</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Lengkap</label>
                <input 
                  type="email" 
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Peran (Role)</label>
                  <select 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3D2E] font-medium"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="Customer">Customer</option>
                    <option value="Merchant">Merchant</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Superadmin">Superadmin</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <select 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3D2E] font-medium"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  disabled={isSaving}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 rounded-xl font-bold bg-[#0F3D2E] text-white hover:bg-[#16523F] transition-colors cursor-pointer shadow-md shadow-resurva-dark/20 flex items-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
