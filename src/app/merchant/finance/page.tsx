"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useMerchantContext, Order } from "@/lib/contexts/MerchantContext";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, Search, Wallet, TrendingUp, TrendingDown, ArrowUpRight, 
  ArrowDownLeft, Trash2, Calendar, DollarSign, Filter, RefreshCw, X, Landmark, Coins, ShieldAlert, CheckCircle2, Info
} from "lucide-react";

interface CustomTransaction {
  id: string;
  walletType: "digital" | "offline";
  type: "in" | "out";
  category: string;
  amount: number;
  date: string;
  notes: string;
  isAuto?: boolean;
  paymentDetails?: any;
}

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface WithdrawalRequest {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  date: string;
  status: "Pending" | "Sukses" | "Gagal";
}

const TRANSLATIONS = {
  en: {
    title: "Finance & Cashflow",
    description: "Monitor your digital and offline wallets, log expenses, and review cashflow analytics.",
    totalBalance: "Total Combined Balance",
    digitalWallet: "Digital Wallet",
    offlineWallet: "Offline Wallet (Cash)",
    digitalDesc: "Online sales, QRIS, and payment gateway",
    offlineDesc: "Cash sales and manual cash reserves",
    addTransaction: "Log Transaction",
    income: "Income",
    expense: "Expense",
    netProfit: "Net Cashflow",
    totalIncome: "Total Income",
    totalExpense: "Total Expense",
    allWallets: "All Wallets",
    digital: "Digital Wallet",
    offline: "Offline Wallet",
    allTypes: "All Types",
    searchPlaceholder: "Search notes or reference...",
    tableDate: "Date & Time",
    tableDesc: "Description / Notes",
    tableWallet: "Wallet",
    tableCategory: "Category",
    tableAmount: "Amount",
    tableAction: "Action",
    noTransactions: "No transactions found.",
    recordModalTitle: "Log Financial Transaction",
    txType: "Transaction Type",
    walletType: "Wallet Type",
    category: "Category",
    amount: "Amount (Rp)",
    date: "Date & Time",
    notes: "Notes / Description",
    save: "Save",
    cancel: "Cancel",
    confirmDelete: "Are you sure you want to delete this transaction?",
    successAdd: "Transaction logged successfully!",
    successDelete: "Transaction deleted successfully!",
    chartTitle: "Weekly Cashflow Trend (Income vs Expense)",
    statsHeader: "Financial Performance Stats",
    // Withdrawal
    withdraw: "Withdraw",
    withdrawDesc: "Withdraw digital balance to bank account via Xendit Payouts",
    withdrawModalTitle: "Withdraw Digital Balance (Xendit)",
    bankName: "Bank Name",
    accountNumber: "Account Number",
    accountHolder: "Account Holder Name",
    saveAccountCheckbox: "Save this bank account for future payouts",
    otpTitle: "Security OTP Verification",
    otpSent: "We have sent a 6-digit verification code to your registered mobile number.",
    otpCodeLabel: "Enter Verification Code",
    otpPlaceholder: "Type OTP code here...",
    verifyBtn: "Verify & Submit",
    otpSimulatedText: "Simulated Verification Code: ",
    invalidOtp: "Invalid verification code! Try again.",
    withdrawSuccessTitle: "Withdrawal Requested!",
    withdrawSuccessDesc: "Your payout request is being processed. It will be verified by Xendit shortly.",
    payoutHistoryTitle: "Withdrawal & Payout History",
    tableBank: "Bank Info",
    tableAccount: "Account Number",
    tableHolder: "Holder Name",
    tableStatus: "Status",
    statusPending: "Pending",
    statusSuccess: "Success",
    statusFailed: "Failed",
    cancelWithdrawal: "Cancel",
    confirmCancelWithdrawal: "Are you sure you want to cancel this pending withdrawal?",
    successCancelWithdrawal: "Withdrawal cancelled successfully!",
    insufficientFunds: "Insufficient funds in your digital wallet!",
    // Categories
    catSales: "Product Sales",
    catCapital: "Initial Capital / Funding",
    catAdjustment: "Balance Adjustment",
    catIngredients: "Raw Materials",
    catSalary: "Employee Salaries",
    catUtilities: "Utilities (Water/Electricity)",
    catRent: "Rent",
    catLogistics: "Logistics & Shipping",
    catMarketing: "Marketing & Promo",
    catMaintenance: "Maintenance & Equipment",
    catWithdrawal: "Digital Wallet Withdrawal",
    catOthers: "Others",
  },
  id: {
    title: "Keuangan & Arus Kas",
    description: "Pantau dompet digital dan offline Anda, catat pengeluaran, dan tinjau analitik arus kas.",
    totalBalance: "Total Saldo Gabungan",
    digitalWallet: "Dompet Digital",
    offlineWallet: "Dompet Offline (Tunai)",
    digitalDesc: "Penjualan online, QRIS, dan payment gateway",
    offlineDesc: "Penjualan tunai dan cadangan kas manual",
    addTransaction: "Catat Transaksi",
    income: "Pemasukan",
    expense: "Pengeluaran",
    netProfit: "Arus Kas Bersih",
    totalIncome: "Total Pemasukan",
    totalExpense: "Total Pengeluaran",
    allWallets: "Semua Dompet",
    digital: "Dompet Digital",
    offline: "Dompet Offline",
    allTypes: "Semua Tipe",
    searchPlaceholder: "Cari catatan transaksi...",
    tableDate: "Tanggal & Waktu",
    tableDesc: "Deskripsi / Catatan",
    tableWallet: "Dompet",
    tableCategory: "Kategori",
    tableAmount: "Jumlah",
    tableAction: "Aksi",
    noTransactions: "Tidak ada transaksi ditemukan.",
    recordModalTitle: "Catat Transaksi Keuangan",
    txType: "Tipe Transaksi",
    walletType: "Jenis Dompet",
    category: "Kategori",
    amount: "Jumlah (Rp)",
    date: "Tanggal & Waktu",
    notes: "Catatan / Deskripsi",
    save: "Simpan",
    cancel: "Batal",
    confirmDelete: "Apakah Anda yakin ingin menghapus transaksi ini?",
    successAdd: "Transaksi berhasil dicatat!",
    successDelete: "Transaksi berhasil dihapus!",
    chartTitle: "Tren Arus Kas Mingguan (Masuk vs Keluar)",
    statsHeader: "Statistik Kinerja Keuangan",
    // Withdrawal
    withdraw: "Tarik Dana",
    withdrawDesc: "Cairkan saldo digital ke rekening bank via Xendit Payouts",
    withdrawModalTitle: "Tarik Saldo Digital (Xendit)",
    bankName: "Nama Bank",
    accountNumber: "Nomor Rekening",
    accountHolder: "Nama Pemilik Rekening",
    saveAccountCheckbox: "Simpan rekening ini untuk penarikan berikutnya",
    otpTitle: "Verifikasi Keamanan OTP",
    otpSent: "Kami telah mengirimkan 6 digit kode verifikasi ke nomor handphone Anda yang terdaftar.",
    otpCodeLabel: "Masukkan Kode Verifikasi",
    otpPlaceholder: "Ketik kode OTP di sini...",
    verifyBtn: "Verifikasi & Kirim",
    otpSimulatedText: "Simulasi Kode Verifikasi: ",
    invalidOtp: "Kode verifikasi salah! Silakan coba lagi.",
    withdrawSuccessTitle: "Penarikan Dana Diproses!",
    withdrawSuccessDesc: "Permintaan penarikan dana sedang diproses. Status akan segera diverifikasi oleh Xendit.",
    payoutHistoryTitle: "Riwayat Penarikan Dana (Withdrawal)",
    tableBank: "Info Bank",
    tableAccount: "Nomor Rekening",
    tableHolder: "Nama Pemilik",
    tableStatus: "Status",
    statusPending: "Menunggu",
    statusSuccess: "Sukses",
    statusFailed: "Gagal",
    cancelWithdrawal: "Batalkan",
    confirmCancelWithdrawal: "Apakah Anda yakin ingin membatalkan penarikan dana yang tertunda ini?",
    successCancelWithdrawal: "Penarikan dana berhasil dibatalkan!",
    insufficientFunds: "Saldo dompet digital Anda tidak mencukupi!",
    // Categories
    catSales: "Penjualan Produk",
    catCapital: "Modal Awal / Suntikan Dana",
    catAdjustment: "Penyesuaian Saldo",
    catIngredients: "Bahan Baku",
    catSalary: "Gaji Karyawan",
    catUtilities: "Utilitas (Listrik/Air/Internet)",
    catRent: "Sewa Tempat",
    catLogistics: "Logistik & Pengiriman",
    catMarketing: "Pemasaran & Promo",
    catMaintenance: "Perawatan & Peralatan",
    catWithdrawal: "Penarikan Saldo Digital",
    catOthers: "Lainnya",
  }
};

const DEFAULT_MANUAL_TX: CustomTransaction[] = [
  {
    id: "m1",
    walletType: "offline",
    type: "in",
    category: "catCapital",
    amount: 10000000,
    date: "2026-07-10T08:00",
    notes: "Modal Awal Toko (Kas Tunai)"
  },
  {
    id: "m2",
    walletType: "offline",
    type: "out",
    category: "catRent",
    amount: 2500000,
    date: "2026-07-10T10:00",
    notes: "Sewa Booth / Lapak Bulanan"
  },
  {
    id: "m3",
    walletType: "offline",
    type: "out",
    category: "catIngredients",
    amount: 850000,
    date: "2026-07-11T14:30",
    notes: "Belanja Bahan Baku (Tepung, Mentega, Cokelat)"
  },
  {
    id: "m4",
    walletType: "digital",
    type: "out",
    category: "catUtilities",
    amount: 320000,
    date: "2026-07-12T09:00",
    notes: "Bayar Listrik & Internet Bulanan"
  },
  {
    id: "m5",
    walletType: "digital",
    type: "out",
    category: "catMarketing",
    amount: 500000,
    date: "2026-07-13T16:00",
    notes: "Biaya Instagram Ads Campaign"
  },
  {
    id: "m6",
    walletType: "offline",
    type: "out",
    category: "catMaintenance",
    amount: 150000,
    date: "2026-07-14T11:00",
    notes: "Servis Alat Pemanggang Roti (Mesin Gas)"
  }
];

import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function FinancePage() {
  const { storeId, orders } = useMerchantContext();
  const { lang } = useLanguage();
  const [balances, setBalances] = useState({ digital: 0, offline: 0 });

  const [transactions, setTransactions] = useState<CustomTransaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [walletFilter, setWalletFilter] = useState<"all" | "digital" | "offline">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "in" | "out">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Withdrawal States
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [savedAccount, setSavedAccount] = useState<BankAccount | null>(null);
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

  // Form State
  const [formData, setFormData] = useState({
    walletType: "offline" as "digital" | "offline",
    type: "in" as "in" | "out",
    category: "catSales",
    amount: "",
    date: "",
    notes: ""
  });

  const [selectedTxDetails, setSelectedTxDetails] = useState<CustomTransaction | null>(null);



  const t = TRANSLATIONS[lang];

  // Set default datetime to form when opening modal
  useEffect(() => {
    if (isModalOpen) {
      const now = new Date();
      const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setFormData(prev => ({
        ...prev,
        date: localISO,
        notes: "",
        amount: "",
        category: prev.type === "in" ? "catSales" : "catIngredients"
      }));
    }
  }, [isModalOpen]);

  const loadData = useCallback(async () => {
    if (!storeId) return;
    try {
      // Fetch Balances
      const balData = await apiClient.get<{ digital: number; offline: number }>(
        `/wallets/store/${storeId}/balances`
      );
      setBalances(balData);

      // Fetch Saved Bank Account details (from digital wallet)
      try {
        const digitalWallet = await apiClient.get<any>(
          `/wallets/store/${storeId}?type=digital`
        );
        if (digitalWallet.saved_bank_info) {
          const saved = {
            bankName: digitalWallet.saved_bank_info.bankName,
            accountNumber: digitalWallet.saved_bank_info.accountNumber,
            accountHolder: digitalWallet.saved_bank_info.accountHolder,
          };
          setSavedAccount(saved);
          setWithdrawForm(prev => ({
            ...prev,
            bankName: saved.bankName || "BCA",
            accountNumber: saved.accountNumber || "",
            accountHolder: saved.accountHolder || ""
          }));
        }
      } catch (err) {
        console.error("Failed to load saved bank details:", err);
      }

      // Fetch unified Transaction history
      const txList = await apiClient.get<any[]>(
        `/wallets/store/${storeId}/transactions`
      );
      const mappedTxs = txList.map((tx: any) => ({
        id: tx.id,
        walletType: tx.wallet_type, // "digital" | "offline"
        type: (tx.type === "credit" ? "in" : "out") as "in" | "out",
        category: tx.category,
        amount: Math.abs(tx.amount), // Amount shows positive on UI table
        date: tx.transaction_date,
        notes: tx.note || "",
        isAuto: tx.transaction_id !== null || tx.category === "catSales",
        paymentDetails: tx.payment_details
      }));
      setTransactions(mappedTxs);

      // Fetch Payout/Withdrawal History
      const wList = await apiClient.get<any[]>(
        `/wallets/store/${storeId}/withdrawals`
      );
      const mappedWithdrawals = wList.map((w: any) => ({
        id: w.id,
        bankName: w.bank_name,
        accountNumber: w.account_number,
        accountHolder: w.account_holder,
        amount: w.amount,
        date: w.created_at,
        status: (w.status === "pending" ? "Pending" : w.status === "success" ? "Sukses" : "Gagal") as "Pending" | "Sukses" | "Gagal"
      }));
      setWithdrawals(mappedWithdrawals);

    } catch (err) {
      console.error("Failed to load finance data:", err);
    }
  }, [storeId]);

  // Load live data from backend when storeId is available
  useEffect(() => {
    if (storeId) {
      loadData();
    }
  }, [storeId, loadData]);

  // Show temp toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Merge manual transactions and auto-generated order transactions (fetched together from backend)
  const allTransactions = useMemo(() => {
    return transactions;
  }, [transactions]);

  // Calculate Balances
  const walletBalances = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(tx => {
      const amt = tx.amount;
      if (tx.type === "in") {
        totalIncome += amt;
      } else {
        totalExpense += amt;
      }
    });

    return {
      digital: balances.digital,
      offline: balances.offline,
      total: balances.digital + balances.offline,
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense
    };
  }, [balances, transactions]);

  // Filtered Transactions for UI Table
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(tx => {
      const matchSearch = 
        searchQuery.trim() === "" ||
        tx.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchWallet = walletFilter === "all" || tx.walletType === walletFilter;
      const matchType = typeFilter === "all" || tx.type === typeFilter;
      const matchCategory = categoryFilter === "all" || tx.category === categoryFilter;

      return matchSearch && matchWallet && matchType && matchCategory;
    });
  }, [allTransactions, searchQuery, walletFilter, typeFilter, categoryFilter]);

  // Pagination States for Transactions
  const [txPage, setTxPage] = useState(1);
  const txPerPage = 10;
  const totalTxPages = Math.ceil(filteredTransactions.length / txPerPage);

  const paginatedTransactions = useMemo(() => {
    const start = (txPage - 1) * txPerPage;
    return filteredTransactions.slice(start, start + txPerPage);
  }, [filteredTransactions, txPage]);

  // Reset page when filters change
  useEffect(() => {
    setTxPage(1);
  }, [searchQuery, walletFilter, typeFilter, categoryFilter]);

  // Pagination States for Withdrawals
  const [wdPage, setWdPage] = useState(1);
  const wdPerPage = 5;
  const totalWdPages = Math.ceil(withdrawals.length / wdPerPage);

  const paginatedWithdrawals = useMemo(() => {
    const start = (wdPage - 1) * wdPerPage;
    return withdrawals.slice(start, start + wdPerPage);
  }, [withdrawals, wdPage]);

  // Form Submit Handler (Log Transaction)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      alert("Masukkan nominal yang valid!");
      return;
    }
    if (!storeId) return;

    try {
      const payload = {
        wallet_type: formData.walletType,
        type: formData.type === "in" ? "credit" : "debit",
        category: formData.category,
        amount: Number(formData.amount),
        note: formData.notes.trim() || (formData.type === "in" ? "Pemasukan Manual" : "Pengeluaran Manual"),
        transaction_date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString()
      };

      await apiClient.post(`/wallets/store/${storeId}/transactions`, payload);
      setIsModalOpen(false);
      triggerToast(t.successAdd);
      loadData(); // Refresh UI
    } catch (err: any) {
      alert(`Gagal mencatat transaksi: ${err.message}`);
    }
  };

  // Delete Manual Transaction Handler
  const handleDelete = async (id: string) => {
    if (confirm(t.confirmDelete)) {
      try {
        await apiClient.delete(`/wallets/transactions/${id}`);
        triggerToast(t.successDelete);
        loadData(); // Refresh UI
      } catch (err: any) {
        alert(`Gagal menghapus transaksi: ${err.message}`);
      }
    }
  };

  // Withdrawal Submit Handler (Launches OTP screen)
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmt = Number(withdrawForm.amount);
    
    if (!withdrawAmt || isNaN(withdrawAmt) || withdrawAmt <= 0) {
      alert("Masukkan nominal yang valid!");
      return;
    }

    if (withdrawAmt > walletBalances.digital) {
      alert(t.insufficientFunds);
      return;
    }

    // Generate random simulated 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(otp);
    setEnteredOtp("");
    setOtpError(false);
    setWithdrawStep("otp");
  };

  // Verify OTP & Process Withdrawal Submission
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
      loadData(); // Refresh UI
    } catch (err: any) {
      alert(`Gagal mengajukan penarikan: ${err.message}`);
    }
  };

  // Cancel Pending Payout Request Handler
  const handleCancelWithdrawal = async (wId: string) => {
    if (confirm(t.confirmCancelWithdrawal)) {
      try {
        await apiClient.post(`/wallets/withdrawals/${wId}/cancel`, {});
        triggerToast(t.successCancelWithdrawal);
        loadData(); // Refresh UI
      } catch (err: any) {
        alert(`Gagal membatalkan penarikan: ${err.message}`);
      }
    }
  };

  // Get localized category name
  const getCategoryLabel = (catKey: string) => {
    return t[catKey as keyof typeof t] || catKey;
  };

  // Format IDR helper
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Format Date Helper
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const categoriesList = [
    "catSales", "catCapital", "catAdjustment", "catIngredients", 
    "catSalary", "catUtilities", "catRent", "catLogistics", 
    "catMarketing", "catMaintenance", "catWithdrawal", "catOthers"
  ];

  const indonesianBanks = [
    "BCA", "Mandiri", "BNI", "BRI", "Bank Jago", "CIMB Niaga", "Permata", "BSI"
  ];

  return (
    <div className="space-y-8 p-4 md:p-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce text-xs md:text-sm">
          <Badge variant="default" className="bg-emerald-500 text-white">✓</Badge>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Coins className="w-7 h-7 text-resurva-dark" />
            {t.title}
          </h1>
          <p className="text-slate-500 mt-1">{t.description}</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-resurva-dark hover:bg-resurva-dark-light text-white font-semibold flex items-center gap-2 rounded-xl py-3 px-5 shadow-sm border border-resurva-dark-light transition-all"
        >
          <Plus className="w-5 h-5" />
          {t.addTransaction}
        </Button>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Total Combined Balance */}
        <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-slate-900 to-slate-950 text-white relative overflow-hidden flex flex-col justify-between h-full">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
            <Landmark className="w-48 h-48" />
          </div>
          <div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-resurva-gold" />
                {t.totalBalance}
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                {lang === "en" ? "Consolidated balance of all active wallets" : "Akumulasi saldo dari seluruh dompet aktif"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-2xl font-extrabold tracking-tight text-white">{formatIDR(walletBalances.total)}</div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Net profit</span> {formatIDR(walletBalances.net)}
              </p>
            </CardContent>
          </div>
        </Card>

        {/* Digital Wallet Card */}
        <Card className="border-slate-200/60 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col justify-between h-full">
          <div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  {t.digitalWallet}
                </span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Active</Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">{t.digitalDesc}</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-2xl font-extrabold text-slate-900">{formatIDR(walletBalances.digital)}</div>
              <p className="text-xs text-slate-500 mt-2">
                {orders.filter(o => o.status === "Selesai" && o.paymentMethod !== "Tunai").length} {lang === "en" ? "online transactions synced" : "transaksi online tersinkron"}
              </p>
            </CardContent>
          </div>
        </Card>

        {/* Offline Wallet Card */}
        <Card className="border-slate-200/60 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col justify-between h-full">
          <div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600" />
                  {t.offlineWallet}
                </span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Cashbox</Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">{t.offlineDesc}</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-2xl font-extrabold text-slate-900">{formatIDR(walletBalances.offline)}</div>
              <p className="text-xs text-slate-500 mt-2">
                {allTransactions.filter(t => t.walletType === "offline").length} {lang === "en" ? "cash records active" : "catatan kas aktif"}
              </p>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Transaction History Section */}
      <Card id="transaction-history-section" className="border-slate-200/60 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">{lang === "en" ? "Recent Transactions" : "Riwayat Transaksi Terbaru"}</CardTitle>
              <CardDescription className="text-xs text-slate-400">{lang === "en" ? "Search and filter through manual and order entries" : "Cari dan saring catatan transaksi manual serta pesanan"}</CardDescription>
            </div>
            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="pl-9 pr-4 py-2 border-slate-200 text-slate-700 rounded-lg text-xs"
                />
              </div>

              {/* Wallet Filter */}
              <select
                value={walletFilter}
                onChange={e => setWalletFilter(e.target.value as any)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs bg-slate-50 font-medium focus:outline-none"
              >
                <option value="all">{t.allWallets}</option>
                <option value="digital">{t.digital}</option>
                <option value="offline">{t.offline}</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs bg-slate-50 font-medium focus:outline-none"
              >
                <option value="all">{t.allTypes}</option>
                <option value="in">{t.income}</option>
                <option value="out">{t.expense}</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs bg-slate-50 font-medium focus:outline-none"
              >
                <option value="all">{lang === "en" ? "All Categories" : "Semua Kategori"}</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-600">{t.tableDate}</TableHead>
                <TableHead className="font-semibold text-slate-600">{t.tableCategory}</TableHead>
                <TableHead className="font-semibold text-slate-600">{t.tableDesc}</TableHead>
                <TableHead className="font-semibold text-slate-600">{t.tableWallet}</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">{t.tableAmount}</TableHead>
                <TableHead className="font-semibold text-slate-600 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    {t.noTransactions}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map(tx => (
                  <TableRow key={tx.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-slate-500 font-medium text-xs">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium text-xs">
                      {getCategoryLabel(tx.category)}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate font-medium text-slate-800 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{tx.notes}</span>
                        {!tx.isAuto && (
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 py-0 text-[9px] h-3.5">Manual</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] h-4.5 px-2 font-semibold ${tx.walletType === "digital" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                      >
                        {tx.walletType === "digital" ? "Digital" : "Cash"}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-black text-xs ${tx.type === "in" ? "text-emerald-600" : "text-rose-600"}`}>
                      <span className="mr-0.5">{tx.type === "in" ? "+" : "-"}</span>
                      {formatIDR(tx.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      {tx.isAuto ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTxDetails(tx)}
                          className="h-7 w-7 text-slate-400 hover:text-slate-650 hover:bg-slate-50 p-0 rounded-lg"
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalTxPages > 1 && (
            <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500 font-medium">
                {lang === "en"
                  ? `Showing ${(txPage - 1) * txPerPage + 1} to ${Math.min(txPage * txPerPage, filteredTransactions.length)} of ${filteredTransactions.length} entries`
                  : `Menampilkan ${(txPage - 1) * txPerPage + 1} sampai ${Math.min(txPage * txPerPage, filteredTransactions.length)} dari ${filteredTransactions.length} entri`}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={txPage === 1}
                  onClick={() => setTxPage(prev => Math.max(prev - 1, 1))}
                  className="text-xs h-8 font-semibold rounded-lg"
                >
                  {lang === "en" ? "Previous" : "Sebelumnya"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={txPage === totalTxPages}
                  onClick={() => setTxPage(prev => Math.min(prev + 1, totalTxPages))}
                  className="text-xs h-8 font-semibold rounded-lg"
                >
                  {lang === "en" ? "Next" : "Berikutnya"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal & Payout History Section */}
      <Card className="border-slate-200/60 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">{t.payoutHistoryTitle}</CardTitle>
          <CardDescription className="text-xs text-slate-400">{lang === "en" ? "Trace status audits for your Xendit payouts" : "Lacak audit status untuk pencairan dana Xendit Anda"}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-600">{t.tableDate}</TableHead>
                <TableHead className="font-semibold text-slate-600">{t.tableBank}</TableHead>
                <TableHead className="font-semibold text-slate-600">{t.tableAccount}</TableHead>
                <TableHead className="font-semibold text-slate-600">{t.tableHolder}</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">{t.tableAmount}</TableHead>
                <TableHead className="font-semibold text-slate-600 text-center">{t.tableStatus}</TableHead>
                <TableHead className="font-semibold text-slate-600 text-center">{t.tableAction}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    {lang === "en" ? "No payouts requested yet." : "Belum ada pengajuan pencairan dana."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedWithdrawals.map(w => (
                  <TableRow key={w.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-slate-500 font-medium text-xs">
                      {formatDate(w.date)}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800 text-xs">
                      {w.bankName}
                    </TableCell>
                    <TableCell className="text-slate-600 font-mono text-xs">
                      {w.accountNumber}
                    </TableCell>
                    <TableCell className="text-slate-700 font-medium text-xs">
                      {w.accountHolder}
                    </TableCell>
                    <TableCell className="text-right font-black text-slate-800 text-xs">
                      {formatIDR(w.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 font-semibold ${
                          w.status === "Sukses"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : w.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {w.status === "Pending" ? t.statusPending : w.status === "Sukses" ? t.statusSuccess : t.statusFailed}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {w.status === "Pending" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelWithdrawal(w.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-lg"
                        >
                          {t.cancelWithdrawal}
                        </Button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalWdPages > 1 && (
            <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500 font-medium">
                {lang === "en"
                  ? `Showing ${(wdPage - 1) * wdPerPage + 1} to ${Math.min(wdPage * wdPerPage, withdrawals.length)} of ${withdrawals.length} entries`
                  : `Menampilkan ${(wdPage - 1) * wdPerPage + 1} sampai ${Math.min(wdPage * wdPerPage, withdrawals.length)} dari ${withdrawals.length} entri`}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={wdPage === 1}
                  onClick={() => setWdPage(prev => Math.max(prev - 1, 1))}
                  className="text-xs h-8 font-semibold rounded-lg"
                >
                  {lang === "en" ? "Previous" : "Sebelumnya"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={wdPage === totalWdPages}
                  onClick={() => setWdPage(prev => Math.min(prev + 1, totalWdPages))}
                  className="text-xs h-8 font-semibold rounded-lg"
                >
                  {lang === "en" ? "Next" : "Berikutnya"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      {selectedTxDetails && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm md:text-base">
                <Info className="w-5 h-5 text-resurva-dark" />
                {lang === "en" ? "Transaction Details" : "Detail Transaksi"}
              </h3>
              <Button
                variant="ghost"
                onClick={() => setSelectedTxDetails(null)}
                className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-0 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">{lang === "en" ? "Transaction ID" : "ID Transaksi"}</span>
                <span className="col-span-2 text-slate-800 font-semibold font-mono truncate">{selectedTxDetails.id}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">{lang === "en" ? "Notes / Description" : "Catatan / Deskripsi"}</span>
                <span className="col-span-2 text-slate-800 font-semibold">{selectedTxDetails.notes}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">{lang === "en" ? "Date" : "Tanggal"}</span>
                <span className="col-span-2 text-slate-800 font-semibold">{formatDate(selectedTxDetails.date)}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">{lang === "en" ? "Wallet" : "Dompet"}</span>
                <span className="col-span-2 text-slate-800 font-semibold">{selectedTxDetails.walletType === "digital" ? "Digital" : "Cash"}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">{lang === "en" ? "Category" : "Kategori"}</span>
                <span className="col-span-2 text-slate-800 font-semibold">{getCategoryLabel(selectedTxDetails.category)}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">{lang === "en" ? "Amount" : "Nominal"}</span>
                <span className={`col-span-2 font-black ${selectedTxDetails.type === "in" ? "text-emerald-600" : "text-rose-600"}`}>
                  {selectedTxDetails.type === "in" ? "+" : "-"} {formatIDR(selectedTxDetails.amount)}
                </span>
              </div>

              {/* Payment details block (username & account info from digital wallet/Xendit) */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="font-extrabold text-slate-900 mb-2 text-xs md:text-sm">
                  {lang === "en" ? "Sender & Payment Details" : "Detail Pengirim & Pembayaran"}
                </h4>
                {selectedTxDetails.paymentDetails ? (
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-200/60 font-medium text-slate-700">
                    {Object.entries(selectedTxDetails.paymentDetails).map(([key, val]: [string, any]) => (
                      <div key={key} className="flex justify-between text-xs py-0.5">
                        <span className="text-slate-400 capitalize">{key.replace(/_/g, " ")}</span>
                        <span className="text-slate-800 font-semibold truncate max-w-[200px]">
                          {typeof val === "object" ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-slate-50/50 rounded-xl text-slate-400 text-xs font-semibold border border-dashed border-slate-200">
                    {lang === "en" ? "No payment metadata details available." : "Detail metadata pembayaran tidak tersedia."}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <Button
                onClick={() => setSelectedTxDetails(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs"
              >
                {lang === "en" ? "Close" : "Tutup"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Record Financial Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm md:text-base">
                <Plus className="w-5 h-5 text-resurva-dark" />
                {t.recordModalTitle}
              </h3>
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-0 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs md:text-sm">
              {/* Type selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: "in", category: "catSales" }))}
                  className={`py-2 px-4 rounded-xl border font-bold text-center transition-all ${
                    formData.type === "in"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-400 ring-2 ring-emerald-400/20"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {t.income}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: "out", category: "catIngredients" }))}
                  className={`py-2 px-4 rounded-xl border font-bold text-center transition-all ${
                    formData.type === "out"
                      ? "bg-rose-50 text-rose-700 border-rose-400 ring-2 ring-rose-400/20"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {t.expense}
                </button>
              </div>

              {/* Wallet Type */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="walletType" className="font-semibold text-slate-700">{t.walletType}</Label>
                  <div className="group relative inline-block cursor-pointer">
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-650 transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-[10px] p-2.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 leading-relaxed font-normal text-left">
                      {lang === "en"
                        ? "Manual entries are restricted to the offline wallet. Digital wallet balances are updated automatically via online orders, and withdrawals can be requested from the Profile page."
                        : "Pencatatan manual hanya diizinkan untuk dompet offline. Saldo dompet digital dicatat otomatis melalui pesanan online, dan penarikannya dapat diajukan di halaman Profil."}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 -mt-1"></div>
                    </div>
                  </div>
                </div>
                <div className="w-full px-3 py-2 border border-slate-200 text-slate-700 bg-slate-50 rounded-lg font-semibold select-none">
                  {lang === "en" ? "Offline Wallet (Cashbox)" : "Dompet Offline (Tunai)"}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category" className="font-semibold text-slate-700">{t.category}</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 text-slate-700 rounded-lg bg-white focus:outline-none"
                >
                  {formData.type === "in" ? (
                    <>
                      <option value="catSales">{getCategoryLabel("catSales")}</option>
                      <option value="catCapital">{getCategoryLabel("catCapital")}</option>
                      <option value="catAdjustment">{getCategoryLabel("catAdjustment")}</option>
                      <option value="catOthers">{getCategoryLabel("catOthers")}</option>
                    </>
                  ) : (
                    <>
                      <option value="catIngredients">{getCategoryLabel("catIngredients")}</option>
                      <option value="catSalary">{getCategoryLabel("catSalary")}</option>
                      <option value="catUtilities">{getCategoryLabel("catUtilities")}</option>
                      <option value="catRent">{getCategoryLabel("catRent")}</option>
                      <option value="catLogistics">{getCategoryLabel("catLogistics")}</option>
                      <option value="catMarketing">{getCategoryLabel("catMarketing")}</option>
                      <option value="catMaintenance">{getCategoryLabel("catMaintenance")}</option>
                      <option value="catWithdrawal">{getCategoryLabel("catWithdrawal")}</option>
                      <option value="catOthers">{getCategoryLabel("catOthers")}</option>
                    </>
                  )}
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="font-semibold text-slate-700">{t.amount}</Label>
                <Input
                  id="amount"
                  type="number"
                  required
                  placeholder="e.g. 500000"
                  value={formData.amount}
                  onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border-slate-200 text-slate-800 rounded-lg focus:outline-none"
                />
              </div>

              {/* Date & Time */}
              <div className="space-y-1.5">
                <Label htmlFor="date" className="font-semibold text-slate-700">{t.date}</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border-slate-200 text-slate-850 rounded-lg focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="font-semibold text-slate-700">{t.notes}</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="e.g. Pembelian tepung terigu 10kg"
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border-slate-200 text-slate-800 rounded-lg focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-slate-200 text-slate-600 rounded-xl"
                >
                  {t.cancel}
                </Button>
                <Button
                  type="submit"
                  className="bg-resurva-dark hover:bg-resurva-dark-light text-white font-bold rounded-xl"
                >
                  {t.save}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Xendit Payout Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm md:text-base">
                <Landmark className="w-5 h-5 text-emerald-600" />
                {t.withdrawModalTitle}
              </h3>
              {withdrawStep !== "otp" && (
                <Button
                  variant="ghost"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-0 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Step 1: Bank Form */}
            {withdrawStep === "form" && (
              <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-4 text-xs md:text-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="bankSelect" className="font-semibold text-slate-700">{t.bankName}</Label>
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
                  <Label htmlFor="accNo" className="font-semibold text-slate-700">{t.accountNumber}</Label>
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
                  <Label htmlFor="accHolder" className="font-semibold text-slate-700">{t.accountHolder}</Label>
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
                    <Label htmlFor="wAmt" className="font-semibold text-slate-700">{t.amount}</Label>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Max: {formatIDR(walletBalances.digital)}
                    </span>
                  </div>
                  <Input
                    id="wAmt"
                    type="number"
                    required
                    placeholder="e.g. 1000000"
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
                    {t.saveAccountCheckbox}
                  </Label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="border-slate-200 text-slate-600 rounded-xl"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm"
                  >
                    {lang === "en" ? "Submit Payout" : "Kirim Permintaan"}
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
                    {t.otpSent}
                  </p>
                </div>

                {/* Simulated helper badge */}
                <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-[10px] font-bold text-amber-800">
                    {t.otpSimulatedText} <span className="font-mono text-xs underline decoration-2">{simulatedOtp}</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="otpInput" className="font-semibold text-slate-700">{t.otpCodeLabel}</Label>
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
                      {t.invalidOtp}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setWithdrawStep("form")}
                    className="flex-1 border-slate-200 text-slate-600 rounded-xl"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                  >
                    {t.verifyBtn}
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
                    {t.withdrawSuccessTitle}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                    {t.withdrawSuccessDesc}
                  </p>
                </div>

                {/* Info Card */}
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-left space-y-2 max-w-sm mx-auto font-medium">
                  <div className="flex justify-between text-slate-500">
                    <span>{t.bankName}</span>
                    <span className="text-slate-800 font-bold">{withdrawForm.bankName}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{t.accountNumber}</span>
                    <span className="text-slate-800 font-mono font-bold">{withdrawForm.accountNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{t.amount}</span>
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
