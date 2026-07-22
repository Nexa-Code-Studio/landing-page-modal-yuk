"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, Clock, ShieldCheck, Save, CheckCircle2, Building2, Lock, ArrowRight, Info, Target, Globe, Edit2, Search, Navigation, Wallet, ArrowUpRight, X, ShieldAlert, Landmark } from "lucide-react";

import { useMerchantContext } from "@/lib/contexts/MerchantContext";
import { apiClient } from "@/lib/api";
import dynamic from "next/dynamic";

const MapDisplay = dynamic(() => import("@/components/ui/MapDisplay"), { ssr: false });

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

import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function MerchantProfilePage() {
  const { lang } = useLanguage();
  const [showToast, setShowToast] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  
  // Modals state
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingOperations, setEditingOperations] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState(false);

  // Profile state
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [latitude, setLatitude] = useState(-7.98);
  const [longitude, setLongitude] = useState(112.63);
  
  // Search & Locate states
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // Category states
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("20:00");
  const [surplusOpenTime, setSurplusOpenTime] = useState("19:30");
  const [surplusCloseTime, setSurplusCloseTime] = useState("21:00");
  const [isOpenForOrders, setIsOpenForOrders] = useState(true);

  // File Upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Enterprise Model state
  const [isBranchOfEnterprise, setIsBranchOfEnterprise] = useState(false);
  const [parentEnterpriseName, setParentEnterpriseName] = useState("");
  const [branchLocation, setBranchLocation] = useState("");

  // Registration modal for standalone stores
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newCorpName, setNewCorpName] = useState("");
  const [newCorpPic, setNewCorpPic] = useState("");
  const [newCorpEmail, setNewCorpEmail] = useState("");
  const [newCorpPhone, setNewCorpPhone] = useState("");

  const { storeId } = useMerchantContext();

  // Digital Wallet & Payout states
  const [digitalBalance, setDigitalBalance] = useState(0);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<"form" | "otp" | "success">("form");
  const [withdrawForm, setWithdrawForm] = useState({
    bankName: "BCA",
    accountNumber: "",
    accountHolder: "",
    amount: "",
    saveAccount: true
  });
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState(false);

  const indonesianBanks = [
    "BCA", "Mandiri", "BNI", "BRI", "Bank Jago", "CIMB Niaga", "Permata", "BSI"
  ];

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const fetchBalances = async () => {
    if (!storeId) return;
    try {
      const data = await apiClient.get<{ digital: number; offline: number; escrow: number }>(
        `/wallets/store/${storeId}/balances`
      );
      if (data) {
        setDigitalBalance(data.digital);
      }

      // Fetch saved bank details if any
      try {
        const digitalWallet = await apiClient.get<any>(
          `/wallets/store/${storeId}?type=digital`
        );
        if (digitalWallet && digitalWallet.saved_bank_info) {
          setWithdrawForm(prev => ({
            ...prev,
            bankName: digitalWallet.saved_bank_info.bankName || "BCA",
            accountNumber: digitalWallet.saved_bank_info.accountNumber || "",
            accountHolder: digitalWallet.saved_bank_info.accountHolder || ""
          }));
        }
      } catch (err) {
        console.error("Failed to load saved bank details:", err);
      }
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchBalances();
    }
  }, [storeId]);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmt = Number(withdrawForm.amount);
    
    if (!withdrawAmt || isNaN(withdrawAmt) || withdrawAmt <= 0) {
      alert("Masukkan nominal yang valid!");
      return;
    }

    if (withdrawAmt > digitalBalance) {
      alert(lang === "en" ? "Insufficient balance!" : "Saldo tidak mencukupi!");
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(otp);
    setEnteredOtp("");
    setOtpError(false);
    setWithdrawStep("otp");
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp !== simulatedOtp) {
      setOtpError(true);
      return;
    }
    if (!storeId) return;

    try {
      const payload = {
        bank_name: withdrawForm.bankName,
        account_number: withdrawForm.accountNumber,
        account_holder: withdrawForm.accountHolder,
        amount: Number(withdrawForm.amount),
        save_account: withdrawForm.saveAccount
      };

      await apiClient.post(`/wallets/store/${storeId}/withdrawals`, payload);
      setWithdrawStep("success");
      fetchBalances(); // Refresh balance
    } catch (err: any) {
      alert(`Gagal mengajukan penarikan: ${err.message}`);
    }
  };

  const fetchStoreProfile = async () => {
    if (!storeId) return;
    try {
      const storeData = await apiClient.get<any>(`/stores/${storeId}`);
      if (storeData) {
        setStoreName(storeData.name || "");
        setDescription(storeData.description || "");
        setCategory(storeData.category || "");
        setAddress(storeData.address || "");
        setLogoUrl(storeData.image_url || "");
        setBannerUrl(storeData.banner_url || "");
        setIsOpenForOrders(storeData.is_active);
        setIsBranchOfEnterprise(storeData.is_branch);
        setParentEnterpriseName(storeData.business?.name || "Independent");
        setLatitude(storeData.latitude || 0);
        setLongitude(storeData.longitude || 0);
        
        const parts = (storeData.name || "").split(" - ");
        setBranchLocation(parts[1] || "Main Outlet");

        // Parse operating_hours for daily schedule (fallback to pickup_time for backward compat)
        const dailySource = storeData.operating_hours || storeData.pickup_time;
        if (dailySource) {
          const match = dailySource.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
          if (match) {
            setOpenTime(match[1]);
            setCloseTime(match[2]);
          }
        }
        // Parse pickup_time for surplus pickup window
        if (storeData.pickup_time) {
          const surplusMatch = storeData.pickup_time.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
          if (surplusMatch) {
            setSurplusOpenTime(surplusMatch[1]);
            setSurplusCloseTime(surplusMatch[2]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch store profile:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiClient.get<string[]>("/stores/categories");
      if (data) {
        setAvailableCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch available categories:", err);
    }
  };

  useEffect(() => {
    fetchStoreProfile();
    fetchCategories();
  }, [storeId]);



  const handleSearchOnMap = async () => {
    if (!address) {
      alert(lang === "id" ? "Silakan masukkan alamat terlebih dahulu untuk mencari." : "Please enter an address first to search.");
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setLatitude(parseFloat(data[0].lat));
        setLongitude(parseFloat(data[0].lon));
      } else {
        alert(lang === "id" 
          ? "Lokasi tidak ditemukan. Coba masukkan nama kota dan jalan yang lebih spesifik." 
          : "Location not found. Try entering a more specific city and street name."
        );
      }
    } catch (error) {
      console.error(error);
      alert(lang === "id" ? "Terjadi kesalahan saat mencari lokasi." : "An error occurred while searching for the location.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      alert(lang === "id" 
        ? "Browser Anda tidak mendukung deteksi lokasi otomatis (GPS)." 
        : "Your browser does not support automatic location detection (GPS)."
      );
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        setIsLocating(false);
        let errorMsg = lang === "id" ? "Gagal mendeteksi lokasi." : "Failed to detect location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = lang === "id" 
            ? "Izin GPS ditolak oleh browser. Silakan aktifkan izin lokasi." 
            : "GPS permission denied by browser. Please enable location permissions.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = lang === "id" 
            ? "Informasi lokasi tidak tersedia." 
            : "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = lang === "id" 
            ? "Permintaan lokasi habis waktu." 
            : "Location request timed out.";
        }
        alert(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const t = TRANSLATIONS[lang];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    setLoading(true);
    try {
      let finalLogoUrl = logoUrl;
      let finalBannerUrl = bannerUrl;

      if (logoFile) {
        const res = await apiClient.uploadFile("/stores/upload-image", logoFile);
        finalLogoUrl = res.access_url;
        setLogoUrl(finalLogoUrl);
        setLogoFile(null);
      }

      if (bannerFile) {
        const res = await apiClient.uploadFile("/stores/upload-image", bannerFile);
        finalBannerUrl = res.access_url;
        setBannerUrl(finalBannerUrl);
        setBannerFile(null);
      }

      await apiClient.put(`/stores/${storeId}`, {
        name: storeName,
        category: category,
        description: description,
        address: address,
        image_url: finalLogoUrl,
        banner_url: finalBannerUrl,
        latitude: latitude,
        longitude: longitude,
      });

      setEditingProfile(false);
      setToastMessage(t.successMsg);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOperations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    setLoading(true);
    try {
      await apiClient.put(`/stores/${storeId}`, {
        operating_hours: `${openTime} - ${closeTime} WIB`,
        pickup_time: `${surplusOpenTime} - ${surplusCloseTime} WIB`,
        is_active: isOpenForOrders,
      });

      setEditingOperations(false);
      setToastMessage(t.successMsg);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Failed to save operations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEnterprise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCorpName || !storeId) return;
    setLoading(true);
    try {
      await apiClient.post(`/stores/${storeId}/enterprise-requests`, {
        corporate_name: newCorpName,
        pic_name: newCorpPic,
        email: newCorpEmail,
        phone: newCorpPhone,
      });

      setIsRegisterModalOpen(false);
      setEditingEnterprise(false);

      setToastMessage(t.alertRegistered);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        window.location.reload();
      }, 1500);
      
      setNewCorpName("");
      setNewCorpPic("");
      setNewCorpEmail("");
      setNewCorpPhone("");
    } catch (err) {
      console.error("Failed to register enterprise:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      const url = URL.createObjectURL(file);
      setBannerUrl(url);
    }
  };

  // MODAL 1: Edit Profile
  const renderEditProfileModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8 max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={handleSaveProfile} className="flex flex-col max-h-[85vh] overflow-hidden">
          <div className="p-6 sm:px-8 sm:py-6 border-b border-slate-100 shrink-0">
            <h3 className="text-xl font-bold text-slate-800 mb-1">Edit Profil Umum</h3>
            <p className="text-sm text-slate-500">Perbarui identitas, deskripsi, dan lokasi toko.</p>
          </div>
          
          <div className="p-6 sm:p-8 overflow-y-auto space-y-10 flex-1">
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
                    <div className="space-y-2 relative">
                      <Label htmlFor="storeCategory">{t.storeCategory}</Label>
                      <div className="relative">
                        <Input 
                          id="storeCategory" 
                          value={category} 
                          onChange={(e) => {
                            setCategory(e.target.value);
                            setShowCategoryDropdown(true);
                          }}
                          onFocus={() => setShowCategoryDropdown(true)}
                          onBlur={() => {
                            setTimeout(() => setShowCategoryDropdown(false), 200);
                          }}
                          placeholder={lang === "id" ? "Cari atau masukkan kategori baru..." : "Search or enter new category..."}
                          className="rounded-xl border-slate-200 w-full pr-8"
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 focus:outline-none"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {showCategoryDropdown && (
                        <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto divide-y divide-slate-50 py-1">
                          {availableCategories.filter((c) =>
                            c.toLowerCase().includes(category.toLowerCase())
                          ).length > 0 ? (
                            availableCategories
                              .filter((c) => c.toLowerCase().includes(category.toLowerCase()))
                              .map((catName) => (
                                <button
                                  key={catName}
                                  type="button"
                                  onClick={() => {
                                    setCategory(catName);
                                    setShowCategoryDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                                >
                                  {catName}
                                </button>
                              ))
                          ) : (
                            category && (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCategoryDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors font-medium italic"
                              >
                                {lang === "id"
                                  ? `Gunakan kategori baru: "${category}"`
                                  : `Use new category: "${category}"`}
                              </button>
                            )
                          )}
                        </div>
                      )}
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
                    <div className="flex gap-2">
                      <Input 
                        id="storeAddress" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        className="rounded-xl border-slate-200 flex-1"
                        placeholder={lang === "id" ? "Masukkan alamat lengkap toko Anda" : "Enter your store's full address"}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={handleSearchOnMap} 
                        disabled={isSearching}
                        className="text-xs h-9 rounded-lg"
                      >
                        <Search className="w-3.5 h-3.5 mr-1" />
                        {isSearching ? (lang === "id" ? "Mencari..." : "Searching...") : (lang === "id" ? "Cari di Peta" : "Search on Map")}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleAutoLocate}
                        disabled={isLocating}
                        className="text-xs h-9 rounded-lg"
                      >
                        <Navigation className="w-3.5 h-3.5 mr-1" />
                        {isLocating ? (lang === "id" ? "Mendeteksi..." : "Locating...") : (lang === "id" ? "Gunakan GPS" : "Use GPS")}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 font-bold text-slate-700">
                      <Globe className="w-4 h-4 text-slate-500" />
                      Peta Lokasi Toko
                    </Label>
                    <div className="text-xs text-slate-500 mb-2">
                      Geser penanda (marker) pada peta di bawah ini untuk menentukan titik koordinat lokasi toko Anda secara presisi.
                    </div>
                    <MapDisplay 
                      latitude={latitude} 
                      longitude={longitude} 
                      name={storeName || "Lokasi Toko"} 
                      draggable={true} 
                      onLocationChange={(lat, lng) => {
                        setLatitude(lat);
                        setLongitude(lng);
                      }}
                      instanceId="edit-map"
                    />
                  </div>

                  {/* Manual Coordinate Form */}
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">Input Koordinat Manual</span>
                      <span className="text-[10px] text-slate-400 italic">Gunakan form ini jika Anda tidak dapat menggunakan GPS atau menyeret marker.</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="latitude" className="text-xs font-medium text-slate-600">Latitude</Label>
                        <Input 
                          id="latitude" 
                          type="number"
                          step="any"
                          value={latitude} 
                          onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)} 
                          className="rounded-xl border-slate-200 bg-white"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude" className="text-xs font-medium text-slate-600">Longitude</Label>
                        <Input 
                          id="longitude" 
                          type="number"
                          step="any"
                          value={longitude} 
                          onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)} 
                          className="rounded-xl border-slate-200 bg-white"
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl shrink-0">
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

            <section className="space-y-4 mt-6 pt-6 border-t border-dashed border-slate-200">
              <div>
                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-600">
                    <Clock className="w-4 h-4" />
                  </span>
                  Jam Pengambilan Paket Surplus
                </h4>
                <p className="text-xs text-slate-500 mt-1">Atur jadwal waktu pelanggan bisa mengambil paket makanan surplus. Berbeda dengan jam operasional toko.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="surplusOpenTime">Waktu Mulai</Label>
                  <Input 
                    id="surplusOpenTime" 
                    type="time" 
                    value={surplusOpenTime} 
                    onChange={(e) => setSurplusOpenTime(e.target.value)} 
                    className="rounded-xl border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surplusCloseTime">Waktu Selesai</Label>
                  <Input 
                    id="surplusCloseTime" 
                    type="time" 
                    value={surplusCloseTime} 
                    onChange={(e) => setSurplusCloseTime(e.target.value)} 
                    className="rounded-xl border-slate-200"
                  />
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
           {bannerUrl && <img src={bannerUrl} className="absolute inset-0 w-full h-full object-cover" />}
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

                <div className="pt-4 border-t border-dashed border-slate-200 mt-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Lokasi Toko</p>
                  <MapDisplay latitude={latitude} longitude={longitude} name={storeName || "Lokasi Toko"} instanceId="view-map" />
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

                <div className="pt-4 border-t border-dashed border-slate-200">
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
                  <div className="flex items-start gap-4 mt-3">
                    <div className="p-2.5 bg-amber-50 rounded-xl shrink-0 opacity-0 hidden md:block"><Clock className="w-4 h-4 text-amber-600" /></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Jam Pengambilan Paket Surplus</p>
                      <p className="text-sm font-medium text-slate-900">{surplusOpenTime} WIB - {surplusCloseTime} WIB</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-dashed border-slate-200">
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

                  <div className="pt-4 border-t border-dashed border-slate-200">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        {lang === "en" ? "Digital Wallet" : "Dompet Digital"}
                      </h4>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          {lang === "en" ? "Digital Balance" : "Saldo Digital"}
                        </p>
                        <p className="text-2xl font-black text-slate-900">{formatIDR(digitalBalance)}</p>
                      </div>
                      
                      <Button
                        onClick={() => {
                          if (digitalBalance <= 0) {
                            alert(lang === "en" ? "Insufficient funds in your digital wallet!" : "Saldo dompet digital Anda tidak mencukupi!");
                            return;
                          }
                          setIsWithdrawModalOpen(true);
                          setWithdrawStep("form");
                        }}
                        className="bg-emerald-600 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs py-2.5 px-4 flex items-center justify-center gap-1 shadow-sm transition-colors border border-emerald-700 sm:w-auto w-full"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        {lang === "en" ? "Withdraw Funds" : "Tarik Dana"}
                      </Button>
                    </div>
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

      {/* Withdrawal Xendit Payout Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm md:text-base">
                <Landmark className="w-5 h-5 text-emerald-600" />
                {lang === "en" ? "Withdraw Digital Wallet Balance" : "Tarik Saldo Dompet Digital"}
              </h3>
              {withdrawStep !== "otp" && (
                <Button
                  variant="ghost"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="h-8 w-8 text-slate-400 hover:text-slate-650 hover:bg-slate-100 p-0 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Step 1: Bank Form */}
            {withdrawStep === "form" && (
              <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-4 text-xs md:text-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="bankSelect" className="font-semibold text-slate-700">
                    {lang === "en" ? "Bank Name" : "Nama Bank"}
                  </Label>
                  <select
                    id="bankSelect"
                    required
                    value={withdrawForm.bankName}
                    onChange={e => setWithdrawForm(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 text-slate-700 rounded-lg bg-white focus:outline-none"
                  >
                    {indonesianBanks.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="accNo" className="font-semibold text-slate-700">
                    {lang === "en" ? "Account Number" : "Nomor Rekening"}
                  </Label>
                  <Input
                    id="accNo"
                    type="text"
                    required
                    placeholder="e.g. 8412852230"
                    value={withdrawForm.accountNumber}
                    onChange={e => setWithdrawForm(prev => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, "") }))}
                    className="w-full px-3 py-2 border-slate-200 text-slate-800 rounded-lg font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="accHolder" className="font-semibold text-slate-700">
                    {lang === "en" ? "Account Holder Name" : "Nama Pemilik Rekening"}
                  </Label>
                  <Input
                    id="accHolder"
                    type="text"
                    required
                    placeholder="e.g. AHMAD HIDAYAT"
                    value={withdrawForm.accountHolder}
                    onChange={e => setWithdrawForm(prev => ({ ...prev, accountHolder: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 border-slate-200 text-slate-800 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="wAmt" className="font-semibold text-slate-700">
                      {lang === "en" ? "Amount" : "Nominal"}
                    </Label>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Max: {formatIDR(digitalBalance)}
                    </span>
                  </div>
                  <Input
                    id="wAmt"
                    type="number"
                    required
                    placeholder="e.g. 100000"
                    value={withdrawForm.amount}
                    onChange={e => setWithdrawForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border-slate-200 text-slate-800 rounded-lg focus:outline-none font-bold"
                  />
                </div>

                {/* Save bank details checkbox */}
                <div className="flex items-center gap-2 py-1">
                  <input
                    id="saveBank"
                    type="checkbox"
                    checked={withdrawForm.saveAccount}
                    onChange={e => setWithdrawForm(prev => ({ ...prev, saveAccount: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Label htmlFor="saveBank" className="text-[10px] text-slate-500 font-medium cursor-pointer">
                    {lang === "en" ? "Save bank details for future payouts" : "Simpan info rekening untuk penarikan berikutnya"}
                  </Label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="border-slate-200 text-slate-600 rounded-xl"
                  >
                    {lang === "en" ? "Cancel" : "Batal"}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm"
                  >
                    {lang === "en" ? "Submit Payout" : "Tarik Dana"}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {withdrawStep === "otp" && (
              <form onSubmit={handleVerifyOtpSubmit} className="p-6 space-y-4 text-xs md:text-sm">
                <div className="text-center space-y-2">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold mx-auto">
                    Xendit OTP Required
                  </Badge>
                  <p className="text-slate-600 text-xs font-medium leading-relaxed">
                    {lang === "en" 
                      ? "We have sent a verification code to your registered WhatsApp/SMS. Enter the code below." 
                      : "Kami telah mengirimkan kode verifikasi ke nomor terdaftar Anda. Masukkan kode di bawah."}
                  </p>
                </div>

                {/* Simulated helper badge */}
                <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-[10px] font-bold text-amber-800">
                    {lang === "en" ? "[Simulated OTP]:" : "[Simulasi OTP]:"} <span className="font-mono text-xs underline decoration-2">{simulatedOtp}</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="otpInput" className="font-semibold text-slate-700">
                    {lang === "en" ? "Verification Code" : "Kode Verifikasi"}
                  </Label>
                  <Input
                    id="otpInput"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={enteredOtp}
                    onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-2 border-slate-200 text-slate-800 rounded-lg text-center font-mono text-lg font-bold tracking-widest focus:outline-none"
                  />
                  {otpError && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1 text-center">
                      {lang === "en" ? "Invalid OTP verification code. Please try again." : "Kode verifikasi OTP salah. Silakan coba lagi."}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setWithdrawStep("form")}
                    className="flex-1 border-slate-200 text-slate-650 rounded-xl"
                  >
                    {lang === "en" ? "Back" : "Kembali"}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                  >
                    {lang === "en" ? "Verify & Withdraw" : "Verifikasi & Tarik"}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Success Screen */}
            {withdrawStep === "success" && (
              <div className="p-6 text-center space-y-6 text-xs md:text-sm">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 text-base md:text-lg">
                    {lang === "en" ? "Withdrawal Requested" : "Penarikan Diajukan"}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                    {lang === "en" 
                      ? "Your payout is being processed via Xendit. Funds should arrive in your bank account shortly." 
                      : "Dana penarikan sedang diproses via Xendit dan akan masuk ke rekening Anda dalam beberapa saat."}
                  </p>
                </div>

                {/* Info Card */}
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-left space-y-2 max-w-sm mx-auto font-medium">
                  <div className="flex justify-between text-slate-500">
                    <span>{lang === "en" ? "Bank Name" : "Nama Bank"}</span>
                    <span className="text-slate-800 font-bold">{withdrawForm.bankName}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{lang === "en" ? "Account Number" : "Nomor Rekening"}</span>
                    <span className="text-slate-800 font-mono font-bold">{withdrawForm.accountNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{lang === "en" ? "Amount" : "Nominal"}</span>
                    <span className="text-emerald-700 font-black">{formatIDR(Number(withdrawForm.amount))}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-200">
                    <span>Status callback</span>
                    <span className="text-amber-600 font-bold animate-pulse">Xendit Payout Pending (5s)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                  >
                    {lang === "en" ? "Done" : "Selesai"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
