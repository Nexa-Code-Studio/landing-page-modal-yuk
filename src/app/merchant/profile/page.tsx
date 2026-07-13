"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Store, MapPin, Clock, ShieldCheck, Save, CheckCircle2, Building2, Lock, ArrowRight, Info, Target, Globe, Edit2 } from "lucide-react";

const TRANSLATIONS = {
  en: {
    title: "Store Profile",
    description: "Manage your store details, operating hours, and enterprise integration settings.",
    saveBtn: "Save Settings",
    successMsg: "Profile settings saved successfully!",
    generalSection: "General Information",
    storeName: "Store Name",
    storeDesc: "Store Description",
    storeCategory: "Store Category",
    storeAddress: "Store Address",
    logoLabel: "Store Logo",
    bannerLabel: "Store Banner",
    uploadPlaceholder: "Click or drag to upload",
    operationSection: "Operating Hours",
    openingHours: "Opening Hours",
    closingHours: "Closing Hours",
    isOpenLabel: "Open for Orders",
    isOpenDesc: "If disabled, customers cannot place orders on the marketplace.",
    integrationSection: "Enterprise Status",
    integrationDesc: "Verify your corporate link. Independent stores can scale up by registering a new enterprise.",
    statusLabel: "Business Model",
    standaloneLabel: "Independent Store (Standalone)",
    standaloneDesc: "You operate as a standalone business. Your corporate model is independent.",
    enterpriseBranchLabel: "Enterprise Managed Outlet",
    enterpriseBranchDesc: "Your outlet is managed and owned by a parent corporate enterprise.",
    parentEnterpriseName: "Parent Enterprise Name",
    branchId: "Branch ID / Location Name",
    lockedTooltip: "Locked: Branch model is governed by your parent corporate account.",
    growTitle: "Scale Up Your Business",
    growDesc: "Register a parent corporate Enterprise account to manage multiple branches, access bulk analytics, and consolidate sustainability reports.",
    registerEnterpriseBtn: "Register Enterprise Account",
    modalTitle: "Register Parent Enterprise",
    modalDesc: "Establish a corporate profile to link and govern your retail outlets.",
    corpName: "Corporate Entity Name",
    corpPic: "Corporate PIC Name",
    corpEmail: "Corporate Email Address",
    corpPhone: "Corporate Phone Number",
    submitBtn: "Establish Enterprise",
    cancelBtn: "Cancel",
    alertRegistered: "Your store is now successfully linked to the new Enterprise!"
  },
  id: {
    title: "Profil Toko",
    description: "Kelola detail toko Anda, jam operasional, dan pengaturan integrasi enterprise.",
    saveBtn: "Simpan Pengaturan",
    successMsg: "Pengaturan berhasil diperbarui!",
    generalSection: "Informasi Umum",
    storeName: "Nama Toko",
    storeDesc: "Deskripsi Toko",
    storeCategory: "Kategori Toko",
    storeAddress: "Alamat Toko",
    logoLabel: "Logo Toko",
    bannerLabel: "Banner Toko",
    uploadPlaceholder: "Klik untuk mengunggah gambar",
    operationSection: "Jam Operasional",
    openingHours: "Jam Buka",
    closingHours: "Jam Tutup",
    isOpenLabel: "Buka untuk Pesanan",
    isOpenDesc: "Jika dinonaktifkan, pelanggan tidak dapat memesan makanan di marketplace.",
    integrationSection: "Status Enterprise",
    integrationDesc: "Verifikasi keterkaitan korporasi Anda. Toko mandiri dapat berkembang dengan mendaftarkan enterprise baru.",
    statusLabel: "Model Bisnis",
    standaloneLabel: "Toko Mandiri (Standalone)",
    standaloneDesc: "Anda beroperasi sebagai bisnis mandiri. Model korporasi Anda adalah independen.",
    enterpriseBranchLabel: "Outlet Terkelola Enterprise",
    enterpriseBranchDesc: "Outlet Anda dikelola dan dimiliki oleh perusahaan induk enterprise.",
    parentEnterpriseName: "Nama Enterprise Induk",
    branchId: "ID Cabang / Nama Lokasi",
    lockedTooltip: "Terkunci: Model cabang diatur langsung oleh akun induk korporasi Anda.",
    growTitle: "Kembangkan Bisnis Anda",
    growDesc: "Daftarkan akun Enterprise induk untuk mengelola banyak cabang, mengakses analitik gabungan, dan mengonsolidasi laporan emisi karbon.",
    registerEnterpriseBtn: "Daftarkan Akun Enterprise",
    modalTitle: "Daftar Enterprise Induk",
    modalDesc: "Buat profil korporasi untuk menghubungkan dan mengatur outlet ritel Anda.",
    corpName: "Nama Entitas Korporasi",
    corpPic: "Nama PIC Korporasi",
    corpEmail: "Alamat Email Korporasi",
    corpPhone: "Nomor Telepon Korporasi",
    submitBtn: "Buat Akun Enterprise",
    cancelBtn: "Batal",
    alertRegistered: "Toko Anda sekarang berhasil terhubung dengan Enterprise baru!"
  }
};

export default function MerchantProfilePage() {
  const [lang, setLang] = useState<"en" | "id">("en");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Modals state
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingOperations, setEditingOperations] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState(false);

  // Profile state
  const [storeName, setStoreName] = useState("UMKM Berkah");
  const [description, setDescription] = useState("Menyediakan aneka roti, kue, dan makanan berat fresh harian.");
  const [category, setCategory] = useState("Bakery & Cafe");
  const [address, setAddress] = useState("Jl. Soekarno Hatta No. 45, Lowokwaru, Malang");
  const [logoUrl, setLogoUrl] = useState("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&h=150&q=80");
  const [bannerUrl, setBannerUrl] = useState("");
  
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("20:00");
  const [isOpenForOrders, setIsOpenForOrders] = useState(true);

  // Enterprise Model state
  const [isBranchOfEnterprise, setIsBranchOfEnterprise] = useState(true);
  const [parentEnterpriseName, setParentEnterpriseName] = useState("UMKM Berkah Group");
  const [branchLocation, setBranchLocation] = useState("Cabang Malang");

  // Registration modal for standalone stores
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newCorpName, setNewCorpName] = useState("");
  const [newCorpPic, setNewCorpPic] = useState("");
  const [newCorpEmail, setNewCorpEmail] = useState("");
  const [newCorpPhone, setNewCorpPhone] = useState("");

  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage") as "en" | "id" | null;
    if (savedLang) {
      setLang(savedLang);
    }

    const handleLangChange = () => {
      const currentSaved = localStorage.getItem("preferredLanguage") as "en" | "id" | null;
      if (currentSaved) {
        setLang(currentSaved);
      }
    };
    window.addEventListener("languageChange", handleLangChange);
    return () => window.removeEventListener("languageChange", handleLangChange);
  }, []);

  const t = TRANSLATIONS[lang];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditingProfile(false);
    setToastMessage(t.successMsg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveOperations = (e: React.FormEvent) => {
    e.preventDefault();
    setEditingOperations(false);
    setToastMessage(t.successMsg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleRegisterEnterprise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCorpName) return;

    setParentEnterpriseName(newCorpName);
    setBranchLocation(storeName + " - Main Outlet");
    setIsBranchOfEnterprise(true);
    setIsRegisterModalOpen(false);
    setEditingEnterprise(false);

    setToastMessage(t.alertRegistered);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setLogoUrl(url);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setBannerUrl(url);
    }
  };

  // MODAL 1: Edit Profile
  const renderEditProfileModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8 animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={handleSaveProfile}>
          <div className="p-6 sm:p-8 space-y-10">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Edit Profil Umum</h3>
              <p className="text-sm text-slate-500">Perbarui identitas, deskripsi, dan lokasi toko.</p>
            </div>
            
            <section>
              <h3 className="font-bold text-slate-700 border-b border-slate-100 pb-2 mb-6">{t.generalSection}</h3>
              <div className="flex flex-col sm:flex-row gap-8">
                <div className="w-full sm:w-1/3 space-y-6">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-bold text-slate-650">{t.logoLabel}</Label>
                    <div className="border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center h-40 bg-slate-50 hover:bg-slate-100 transition-colors relative overflow-hidden group cursor-pointer">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-24 h-24 rounded-full object-cover shadow-sm border border-slate-200 mb-2" />
                      ) : (
                        <div className="text-center">
                          <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        </div>
                      )}
                      <p className="text-[10px] text-slate-500 font-medium">Klik untuk unggah</p>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-bold text-slate-650">{t.bannerLabel}</Label>
                    <div className="border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center h-32 bg-slate-50 hover:bg-slate-100 transition-colors relative overflow-hidden group cursor-pointer">
                      {bannerUrl ? (
                        <img src={bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <span className="text-[10px] text-slate-400">{t.uploadPlaceholder}</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleBannerUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="storeName">{t.storeName}</Label>
                      <Input 
                        id="storeName" 
                        value={storeName} 
                        onChange={(e) => setStoreName(e.target.value)} 
                        className="rounded-xl border-slate-200"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storeCategory">{t.storeCategory}</Label>
                      <Input 
                        id="storeCategory" 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        className="rounded-xl border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeDesc">{t.storeDesc}</Label>
                    <Textarea 
                      id="storeDesc" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      rows={3} 
                      className="rounded-xl border-slate-200 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeAddress" className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {t.storeAddress}
                    </Label>
                    <Input 
                      id="storeAddress" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      className="rounded-xl border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl">
            <Button type="button" variant="outline" onClick={() => setEditingProfile(false)}>{t.cancelBtn}</Button>
            <Button type="submit" className="bg-resurva-dark hover:bg-resurva-dark-light text-white">{t.saveBtn}</Button>
          </div>
        </form>
      </div>
    </div>
  );

  // MODAL 2: Edit Operations
  const renderEditOperationsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={handleSaveOperations}>
          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Edit {t.operationSection}</h3>
              <p className="text-sm text-slate-500">Tentukan jam buka/tutup dan atur ketersediaan pesanan toko.</p>
            </div>
            
            <section className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="openTime">{t.openingHours}</Label>
                      <Input 
                        id="openTime" 
                        type="time" 
                        value={openTime} 
                        onChange={(e) => setOpenTime(e.target.value)} 
                        className="rounded-xl border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="closeTime">{t.closingHours}</Label>
                      <Input 
                        id="closeTime" 
                        type="time" 
                        value={closeTime} 
                        onChange={(e) => setCloseTime(e.target.value)} 
                        className="rounded-xl border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="flex items-center justify-between border border-slate-200 rounded-xl p-5 bg-slate-50/50 shadow-sm">
                    <div className="space-y-1 max-w-[75%]">
                      <Label className="text-sm font-bold text-slate-800">{t.isOpenLabel}</Label>
                      <p className="text-xs text-slate-500 leading-relaxed">{t.isOpenDesc}</p>
                    </div>
                    <Switch checked={isOpenForOrders} onCheckedChange={setIsOpenForOrders} />
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl">
            <Button type="button" variant="outline" onClick={() => setEditingOperations(false)}>{t.cancelBtn}</Button>
            <Button type="submit" className="bg-resurva-dark hover:bg-resurva-dark-light text-white">{t.saveBtn}</Button>
          </div>
        </form>
      </div>
    </div>
  );

  // MODAL 3: Edit Enterprise Status
  const renderEditEnterpriseModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Pengaturan {t.integrationSection}</h3>
              <p className="text-sm text-slate-500">Ubah pengaturan model bisnis dan kemitraan.</p>
            </div>
            <button onClick={() => setEditingEnterprise(false)} className="text-slate-400 hover:text-slate-650">✕</button>
          </div>
          
          <div className="w-full">
            {isBranchOfEnterprise ? (
              <div className="space-y-4 border border-resurva-dark/10 bg-resurva-green-muted/10 p-5 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-resurva-dark/10 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-resurva-dark" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.enterpriseBranchLabel}</p>
                    <p className="text-xs text-slate-500 mt-1">{t.lockedTooltip}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-4 mt-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.parentEnterpriseName}</span>
                    <p className="text-sm font-semibold text-slate-800">{parentEnterpriseName}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.branchId}</span>
                    <p className="text-sm font-semibold text-slate-850">{branchLocation}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-10 px-4 border border-red-200"
                    onClick={() => {
                      setIsBranchOfEnterprise(false);
                      setEditingEnterprise(false);
                    }}
                  >
                    Demo: Reset to Standalone
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 border border-slate-200 p-5 rounded-2xl bg-white shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.standaloneLabel}</p>
                    <p className="text-xs text-slate-500 mt-1">{t.standaloneDesc}</p>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="font-bold text-sm text-slate-800">{t.growTitle}</h4>
                  <p className="text-xs text-slate-500">{t.growDesc}</p>
                  <Button 
                    type="button"
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold py-3 shadow-xs mt-2 flex items-center justify-center"
                  >
                    {t.registerEnterpriseBtn}
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-8 w-full max-w-6xl mx-auto pb-24 relative">
      {editingProfile && renderEditProfileModal()}
      {editingOperations && renderEditOperationsModal()}
      {editingEnterprise && renderEditEnterpriseModal()}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">{t.title}</h2>
          <p className="text-slate-500 text-sm">{t.description}</p>
        </div>
        <Button onClick={() => setEditingProfile(true)} variant="outline" className="border-slate-300">
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Profil
        </Button>
      </div>

      {/* Profile Card (Read Only) */}
      <Card className="overflow-hidden border-slate-200 shadow-sm p-0 rounded-2xl">
        <div className="h-32 w-full bg-gradient-to-r from-resurva-dark to-resurva-dark-light relative">
           {bannerUrl && <img src={bannerUrl} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" />}
        </div>
        
        <div className="px-6 md:px-10 pb-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-md flex shrink-0 items-center justify-center text-4xl font-black text-slate-800 overflow-hidden relative">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                storeName.charAt(0)
              )}
            </div>
            <div className="pb-2 flex-1 flex flex-wrap gap-4 justify-between items-end">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{storeName}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{category}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                 <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${isOpenForOrders ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                   <span className={`w-2 h-2 rounded-full ${isOpenForOrders ? "bg-green-500" : "bg-slate-400"}`}></span>
                   {isOpenForOrders ? "Buka" : "Tutup"}
                 </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-slate-800">{t.generalSection}</h4>
              </div>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-slate-100 rounded-xl shrink-0"><MapPin className="w-4 h-4 text-slate-600" /></div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Alamat Toko</p>
                    <p className="text-sm font-medium text-slate-900 leading-relaxed pr-4">{address || "-"}</p>
                  </div>
                </div>
                
                <div className="pt-4 mt-4 border-t border-dashed border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <h4 className="font-bold text-sm text-slate-800">{t.operationSection}</h4>
                    </div>
                    <button onClick={() => setEditingOperations(true)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-slate-100 rounded-xl shrink-0 opacity-0 hidden md:block"><Clock className="w-4 h-4 text-slate-600" /></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Jadwal Buka Harian</p>
                      <p className="text-sm font-medium text-slate-900">{openTime} WIB - {closeTime} WIB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-800 border-b pb-2 mb-4">Tentang Toko</h4>
                  <p className="text-sm text-slate-700 leading-relaxed text-justify">
                    {description || <span className="italic text-slate-400">Belum ada deskripsi toko.</span>}
                  </p>
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <h4 className="font-bold text-slate-800">{t.integrationSection}</h4>
                    <button onClick={() => setEditingEnterprise(true)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Integrasi Ekosistem</p>
                    {isBranchOfEnterprise ? (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-resurva-green-muted/30 rounded-lg"><Building2 className="w-5 h-5 text-resurva-dark" /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{parentEnterpriseName}</p>
                          <p className="text-xs text-slate-500">{t.enterpriseBranchLabel} • {branchLocation}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-200 rounded-lg"><Store className="w-5 h-5 text-slate-600" /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Toko Mandiri</p>
                          <p className="text-xs text-slate-500">{t.standaloneDesc}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Enterprise Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b bg-indigo-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-indigo-900 text-sm">{t.modalTitle}</h3>
                <p className="text-[10px] text-indigo-650 mt-0.5">{t.modalDesc}</p>
              </div>
              <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-slate-650">✕</button>
            </div>
            <form onSubmit={handleRegisterEnterprise} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="newCorpName" className="text-xs">{t.corpName}</Label>
                <Input 
                  id="newCorpName"
                  value={newCorpName}
                  onChange={(e) => setNewCorpName(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newCorpPic" className="text-xs">{t.corpPic}</Label>
                <Input 
                  id="newCorpPic"
                  value={newCorpPic}
                  onChange={(e) => setNewCorpPic(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newCorpEmail" className="text-xs">{t.corpEmail}</Label>
                <Input 
                  id="newCorpEmail"
                  type="email"
                  value={newCorpEmail}
                  onChange={(e) => setNewCorpEmail(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newCorpPhone" className="text-xs">{t.corpPhone}</Label>
                <Input 
                  id="newCorpPhone"
                  value={newCorpPhone}
                  onChange={(e) => setNewCorpPhone(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-2 text-xs">
                <Button type="button" variant="outline" className="rounded-xl h-9" onClick={() => setIsRegisterModalOpen(false)}>
                  {t.cancelBtn}
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9">
                  {t.submitBtn}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
