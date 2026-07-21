"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMerchantContext, Product, ProductBatch, StockTransaction } from "@/lib/contexts/MerchantContext";
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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Smartphone, AlertTriangle, Archive, FileDown, Layers, Plus, Calendar, Settings, ChevronDown, ChevronUp, Search, MoreVertical, History } from "lucide-react";
import { AddProductModal } from "@/components/merchant/AddProductModal";
import { MobilePreviewModal } from "@/components/merchant/MobilePreviewModal";

const TRANSLATIONS = {
  en: {
    title: "Real-Time Expiry Tracker",
    description: "Manage your inventory and monitor food expiration automatically.",
    previewApp: "Preview App",
    addProduct: "Add Product",
    manageCategories: "Manage Categories",
    imageCol: "Image",
    nameCol: "Product Name & SKU",
    categoryCol: "Category",
    stockCol: "Active Stock",
    priceCol: "Price",
    expiryCol: "Expiry",
    marketplaceCol: "Marketplace",
    actionCol: "Action",
    emptyInventory: "No products found in this category.",
    lowStockTitle: "Low Stock",
    safeLabel: "Safe (> 3 Days)",
    surplusLabel: "Surplus (1-3 Days)",
    flashSaleLabel: "Flash Sale (< 24h)",
    regulerLabel: "Regular",
    tabSurplus: "Surplus",
    tabProducts: "Products",
    tabHistory: "History",
    batchIdCol: "Batch ID",
    expiredQtyCol: "Expired Qty",
    expiredDateCol: "Expired Date",
    addBatchBtn: "Add Batch/Stock",
    catModalTitle: "Manage Product Categories",
    addCatBtn: "Add Category",
    newCatPlaceholder: "Category Name...",
    saveBtn: "Save",
    cancelBtn: "Cancel",
    addBatchModalTitle: "Add Batch / Stock for",
    qtyLabel: "Quantity / Stock",
    typeLabel: "Batch Type",
    expiryLabel: "Expiry Date & Time",
    pcs: "pcs",
    seeMore: "See More",
  },
  id: {
    title: "Pemantau Kedaluwarsa Real-Time",
    description: "Kelola inventaris Anda dan pantau tanggal kedaluwarsa secara otomatis.",
    previewApp: "Preview App",
    addProduct: "Tambah Produk",
    manageCategories: "Kelola Kategori",
    imageCol: "Gambar",
    nameCol: "Nama Produk & SKU",
    categoryCol: "Kategori",
    stockCol: "Stok Aktif",
    priceCol: "Harga",
    expiryCol: "Kedaluwarsa",
    marketplaceCol: "Marketplace",
    actionCol: "Aksi",
    emptyInventory: "Tidak ada produk di kategori ini.",
    lowStockTitle: "Stok Menipis",
    safeLabel: "Aman (> 3 Hari)",
    surplusLabel: "Surplus (1-3 Hari)",
    flashSaleLabel: "Flash Sale (< 24j)",
    regulerLabel: "Reguler",
    tabSurplus: "Surplus",
    tabProducts: "Produk",
    tabHistory: "Riwayat",
    batchIdCol: "ID Batch",
    expiredQtyCol: "Jumlah Expired",
    expiredDateCol: "Tanggal Kedaluwarsa",
    addBatchBtn: "Tambah Batch/Stok",
    catModalTitle: "Kelola Kategori Produk",
    addCatBtn: "Tambah Kategori",
    newCatPlaceholder: "Nama Kategori...",
    saveBtn: "Simpan",
    cancelBtn: "Batal",
    addBatchModalTitle: "Tambah Batch / Stok untuk",
    qtyLabel: "Jumlah / Stok",
    typeLabel: "Tipe Batch",
    expiryLabel: "Tanggal & Jam Kedaluwarsa",
    pcs: "pcs",
    seeMore: "Lihat Selengkapnya",
  }
};

import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function InventoryPage() {
  const router = useRouter();
  const {
    products, deleteProduct, updateProduct,
    batches, loadingBatches, addBatch, updateBatch, deleteBatch,
    stockLogs: contextStockLogs, loadingLogs, refetchLogs,
    categories, addCategory, updateCategory, deleteCategory
  } = useMerchantContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { lang } = useLanguage();

  const [activeTab, setActiveTab] = useState<"Surplus" | "Products" | "History">("Surplus");

  // Stock logs now come from context (backend)
  const stockLogs: StockTransaction[] = contextStockLogs;

  /** Returns batches from the shared context array filtered by product id */
  const getProductBatches = (productId: string): ProductBatch[] =>
    batches.filter((b) => {
      // InventoryBatch from backend carries product_id – accessed via our mapped shape
      // Our mapped shape has id (batch id) but not product_id directly.
      // We embed product_id lookup via the batches array returned from the backend.
      // Since MerchantContext fetches store-wide batches, we use a lookup:
      // The context batches don't carry productId field yet – enrich products list instead.
      return false; // placeholder – see enrichedProducts below
    });
  void getProductBatches; // suppress unused warning

  /** Products enriched with their batches from the shared context batches array.
   *  The backend batch array is store-level; we group by matching from product list.
   *  Since BackendBatch maps to ProductBatch without productId, we rely on a side-load.
   *  For now products still render their own batches from the context when available.
   */
  const enrichedProducts = useMemo(() => {
    return products.map((product) => ({
      ...product,
      batches: batches.filter((b) => b.productId === product.id)
    }));
  }, [products, batches]);

  const [filterType, setFilterType] = useState<"Semua" | "Masuk" | "Keluar">("Semua");
  const [filterReason, setFilterReason] = useState<"Semua" | "Transaksi Jual Beli" | "Kadaluarsa" | "Adjustment">("Semua");

  // Load stock logs when History tab is opened
  const handleTabChange = (tab: "Surplus" | "Products" | "History") => {
    setActiveTab(tab);
    if (tab === "History") refetchLogs();
  };

  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = stockLogs.filter(log => {
    const productName = products.find(p => p.id === log.productId)?.name ?? log.productId;
    const matchesSearch = searchQuery.trim() === "" ||
      productName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (log.batchTag && log.batchTag.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      (log.reference && log.reference.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    const matchesType = filterType === "Semua" ||
      (filterType === "Masuk" && log.quantity > 0) ||
      (filterType === "Keluar" && log.quantity < 0);
    const matchesReason = filterReason === "Semua" ||
      (filterReason === "Transaksi Jual Beli" && log.reason === "Transaksi Jual Beli") ||
      (filterReason === "Kadaluarsa" && log.reason === "Kadaluarsa") ||
      (filterReason === "Adjustment" && log.reason !== "Transaksi Jual Beli" && log.reason !== "Kadaluarsa");
    return matchesSearch && matchesType && matchesReason;
  });
  
  // Coordinates and state for external dropdown positioning
  const [activeMenuProduct, setActiveMenuProduct] = useState<Product | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  // Category CRUD Modal state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Add Batch Modal state
  const [selectedProductForBatch, setSelectedProductForBatch] = useState<Product | null>(null);
  const [batchQty, setBatchQty] = useState(10);
  const [batchType, setBatchType] = useState<"Reguler" | "Surplus">("Reguler");
  const [batchExpiry, setBatchExpiry] = useState("");
  const [customSurplusDateEnabled, setCustomSurplusDateEnabled] = useState(false);
  const [batchSurplusDate, setBatchSurplusDate] = useState("");

  // Edit Batch submit handler — calls backend through context
  const handleEditBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch || !editingBatchProduct) return;

    try {
      await updateBatch(editingBatch.id, {
        remaining_quantity: editingBatchQty,
        expired_at: editingBatchExpiry ? new Date(editingBatchExpiry).toISOString() : undefined,
        surplus_starts_at: editingBatchSurplusDateEnabled && editingBatchSurplusDate
          ? new Date(editingBatchSurplusDate).toISOString()
          : undefined,
      });
    } catch (err) {
      console.error("Update batch failed:", err);
    }

    setEditingBatch(null);
    setEditingBatchProduct(null);
  };
  const [editingBatch, setEditingBatch] = useState<ProductBatch | null>(null);
  const [editingBatchQty, setEditingBatchQty] = useState(10);
  const [editingBatchExpiry, setEditingBatchExpiry] = useState("");
  const [editingBatchSurplusDateEnabled, setEditingBatchSurplusDateEnabled] = useState(false);
  const [editingBatchSurplusDate, setEditingBatchSurplusDate] = useState("");
  const [editingBatchProduct, setEditingBatchProduct] = useState<Product | null>(null);

  // Dropdown states for batch actions inside sub-table
  const [activeBatchMenuId, setActiveBatchMenuId] = useState<string | null>(null);



  // Close three-dot menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuProduct(null);
      setActiveBatchMenuId(null);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const t = TRANSLATIONS[lang];
  const nowTime = Date.now();

  const toggleProductExpand = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Helper to generate dynamic batch tag format: {sku}-{DDMMYYYY}-{A/B/C...}
  function getBatchTag(product: Product, batch: ProductBatch) {
    if (!batch.expiryDate) return "-";
    const sku = product.sku || "PROD";
    const expiryDate = new Date(batch.expiryDate);
    
    const day = String(expiryDate.getDate()).padStart(2, '0');
    const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
    const year = expiryDate.getFullYear();
    const dateStr = `${day}${month}${year}`;
    const dateKey = `${year}-${month}-${day}`;
    
    const sameDayBatches = (product.batches || [])
      .filter(b => b.expiryDate)
      .map(b => ({ ...b, dateObj: new Date(b.expiryDate!) }))
      .filter(b => {
        const d = b.dateObj;
        const dDay = String(d.getDate()).padStart(2, '0');
        const dMonth = String(d.getMonth() + 1).padStart(2, '0');
        const dYear = d.getFullYear();
        return `${dYear}-${dMonth}-${dDay}` === dateKey;
      })
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime() || a.id.localeCompare(b.id));
      
    const index = sameDayBatches.findIndex(b => b.id === batch.id);
    const letter = String.fromCharCode(65 + (index >= 0 ? index : 0));
    
    return `${sku}-${dateStr}-${letter}`;
  }

  // Helper function to check if batch is in surplus state
  function isBatchSurplus(product: Product, batch: ProductBatch) {
    if (!batch.expiryDate) return false;
    const expiryTime = new Date(batch.expiryDate).getTime();
    if (expiryTime <= nowTime) return false; // Already expired
    
    if (product.autoSurplusEnabled) {
      const remainingHours = (expiryTime - nowTime) / (1000 * 60 * 60);
      const triggerHours = product.surplusTriggerHours || 0;
      return remainingHours <= triggerHours;
    }
    
    return batch.menuType === "Surplus";
  }

  // Helper function to get surplus start date of batch
  function getBatchSurplusDate(product: Product, batch: ProductBatch) {
    if (batch.surplusStartDate) return batch.surplusStartDate;
    if (product.autoSurplusEnabled && product.surplusTriggerHours && batch.expiryDate) {
      const expiryTime = new Date(batch.expiryDate).getTime();
      const surplusTime = expiryTime - (product.surplusTriggerHours * 60 * 60 * 1000);
      return new Date(surplusTime).toISOString();
    }
    return undefined;
  }

  // Format Date and Time
  const formatExpiryDateTime = (isoStr?: string) => {
    if (!isoStr) return "-";
    const date = new Date(isoStr);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Auto-populate batchExpiry based on estimatedExpiryHours when selectedProductForBatch changes
  useEffect(() => {
    if (selectedProductForBatch) {
      if (selectedProductForBatch.estimatedExpiryHours && selectedProductForBatch.estimatedExpiryHours > 0) {
        setBatchType("Surplus");
        const defaultExpiry = new Date(Date.now() + selectedProductForBatch.estimatedExpiryHours * 60 * 60 * 1000);
        const yyyy = defaultExpiry.getFullYear();
        const mm = String(defaultExpiry.getMonth() + 1).padStart(2, "0");
        const dd = String(defaultExpiry.getDate()).padStart(2, "0");
        const hh = String(defaultExpiry.getHours()).padStart(2, "0");
        const min = String(defaultExpiry.getMinutes()).padStart(2, "0");
        const expiryStr = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
        setBatchExpiry(expiryStr);

        // Check if auto surplus trigger is set
        if (selectedProductForBatch.autoSurplusEnabled && selectedProductForBatch.surplusTriggerHours && selectedProductForBatch.surplusTriggerHours > 0) {
          setCustomSurplusDateEnabled(true);
          const surplusTime = new Date(defaultExpiry.getTime() - selectedProductForBatch.surplusTriggerHours * 60 * 60 * 1000);
          const s_yyyy = surplusTime.getFullYear();
          const s_mm = String(surplusTime.getMonth() + 1).padStart(2, "0");
          const s_dd = String(surplusTime.getDate()).padStart(2, "0");
          const s_hh = String(surplusTime.getHours()).padStart(2, "0");
          const s_min = String(surplusTime.getMinutes()).padStart(2, "0");
          setBatchSurplusDate(`${s_yyyy}-${s_mm}-${s_dd}T${s_hh}:${s_min}`);
        } else {
          setCustomSurplusDateEnabled(false);
          setBatchSurplusDate("");
        }
      } else {
        setBatchType("Reguler");
        setBatchExpiry("");
        setCustomSurplusDateEnabled(false);
        setBatchSurplusDate("");
      }
    }
  }, [selectedProductForBatch]);

  // Update surplus date when expiry changes
  const handleExpiryChange = (val: string) => {
    setBatchExpiry(val);
    if (val && selectedProductForBatch?.autoSurplusEnabled && selectedProductForBatch?.surplusTriggerHours) {
      const expiryTime = new Date(val).getTime();
      const surplusTime = new Date(expiryTime - selectedProductForBatch.surplusTriggerHours * 60 * 60 * 1000);
      const s_yyyy = surplusTime.getFullYear();
      const s_mm = String(surplusTime.getMonth() + 1).padStart(2, "0");
      const s_dd = String(surplusTime.getDate()).padStart(2, "0");
      const s_hh = String(surplusTime.getHours()).padStart(2, "0");
      const s_min = String(surplusTime.getMinutes()).padStart(2, "0");
      setBatchSurplusDate(`${s_yyyy}-${s_mm}-${s_dd}T${s_hh}:${s_min}`);
    }
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    updateProduct(id, { isPublished: !current });
  };

  // Add Category handler
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName("");
    }
  };



  // Add Batch handler – now calls backend through context
  const handleAddBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForBatch) return;

    const expiryISO = batchExpiry ? new Date(batchExpiry).toISOString() : new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const surplusISO = customSurplusDateEnabled && batchSurplusDate ? new Date(batchSurplusDate).toISOString() : undefined;

    try {
      await addBatch(
        selectedProductForBatch.id,
        batchQty,
        batchQty,
        expiryISO,
        surplusISO
      );
    } catch (err) {
      console.error("Add batch failed:", err);
    }

    setSelectedProductForBatch(null);
    setBatchQty(10);
    setBatchExpiry("");
    setCustomSurplusDateEnabled(false);
    setBatchSurplusDate("");
  };

  // Delete Batch handler – now calls backend through context
  const handleDeleteBatch = async (_product: Product, batchId: string) => {
    if (confirm(lang === "en" ? "Are you sure you want to delete this batch?" : "Apakah Anda yakin ingin menghapus batch ini?")) {
      try {
        await deleteBatch(batchId);
      } catch (err) {
        console.error("Delete batch failed:", err);
      }
    }
  };

  // Open Edit Batch modal handler
  const handleOpenEditBatch = (product: Product, batch: ProductBatch) => {
    setEditingBatchProduct(product);
    setEditingBatch(batch);
    setEditingBatchQty(batch.qty);
    if (batch.expiryDate) {
      const date = new Date(batch.expiryDate);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const hh = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      setEditingBatchExpiry(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
    } else {
      setEditingBatchExpiry("");
    }

    const surplusDate = getBatchSurplusDate(product, batch);
    if (surplusDate) {
      setEditingBatchSurplusDateEnabled(true);
      const date = new Date(surplusDate);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const hh = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      setEditingBatchSurplusDate(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
    } else {
      setEditingBatchSurplusDateEnabled(false);
      setEditingBatchSurplusDate("");
    }
  };

  // Update edit expiry surplus date
  const handleEditExpiryChange = (val: string) => {
    setEditingBatchExpiry(val);
    if (val && editingBatchProduct?.autoSurplusEnabled && editingBatchProduct?.surplusTriggerHours) {
      const expiryTime = new Date(val).getTime();
      const surplusTime = new Date(expiryTime - editingBatchProduct.surplusTriggerHours * 60 * 60 * 1000);
      const s_yyyy = surplusTime.getFullYear();
      const s_mm = String(surplusTime.getMonth() + 1).padStart(2, "0");
      const s_dd = String(surplusTime.getDate()).padStart(2, "0");
      const s_hh = String(surplusTime.getHours()).padStart(2, "0");
      const s_min = String(surplusTime.getMinutes()).padStart(2, "0");
      setEditingBatchSurplusDate(`${s_yyyy}-${s_mm}-${s_dd}T${s_hh}:${s_min}`);
    }
  };



  // Auto-expand product rows if search query matches a batch tag
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase();
    
    const matchedProductIds = new Set<string>();
    enrichedProducts.forEach(product => {
      const activeBatches = product.batches?.filter(b => !b.expiryDate || new Date(b.expiryDate).getTime() > nowTime) || [];
      const hasMatchingBatch = activeBatches.some(batch => {
        const batchTag = getBatchTag(product, batch).toLowerCase();
        return batchTag.includes(query);
      });
      if (hasMatchingBatch) {
        matchedProductIds.add(product.id);
      }
    });

    if (matchedProductIds.size > 0) {
      setExpandedProducts(prev => {
        const next = new Set(prev);
        matchedProductIds.forEach(id => next.add(id));
        return next;
      });
    }
  }, [searchQuery, enrichedProducts]);

  // Filter products based on search query (product name, SKU, or batch tag)
  const filteredProducts = enrichedProducts.filter(product => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    // Match product name
    if (product.name.toLowerCase().includes(query)) return true;
    
    // Match product SKU
    if (product.sku && product.sku.toLowerCase().includes(query)) return true;

    // Match any active batch tag
    const activeBatches = product.batches?.filter(b => !b.expiryDate || new Date(b.expiryDate).getTime() > nowTime) || [];
    const hasMatchingBatch = activeBatches.some(batch => {
      const batchTag = getBatchTag(product, batch).toLowerCase();
      return batchTag.includes(query);
    });

    return hasMatchingBatch;
  });

  // Filter products for Surplus tab (have at least one active surplus batch)
  const displayedSurplusProducts = filteredProducts.filter(product => {
    const activeBatches = product.batches?.filter(b => !b.expiryDate || new Date(b.expiryDate).getTime() > nowTime) || [];
    return activeBatches.some(b => isBatchSurplus(product, b));
  });

  return (
    <div className="space-y-6 p-4 md:p-8 font-sans w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">{t.title}</h2>
          <p className="text-slate-500 text-sm">
            {t.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setIsPreviewOpen(true)} variant="outline" className="border-slate-350 text-slate-700 hover:bg-slate-50 rounded-xl">
            <Smartphone className="w-4 h-4 mr-2" />
            {t.previewApp}
          </Button>
          <Button onClick={() => setIsCatModalOpen(true)} variant="outline" className="border-slate-350 text-slate-700 hover:bg-slate-50 rounded-xl">
            <Settings className="w-4 h-4 mr-2" />
            {t.manageCategories}
          </Button>
          <Button onClick={handleAddNew} className="bg-resurva-dark hover:bg-resurva-dark-light text-white rounded-xl font-bold">
            <Plus className="h-5 w-5 mr-2" />
            {t.addProduct}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder={lang === "en" ? "Search product name, SKU, or batch tag..." : "Cari nama produk, SKU, atau tag batch..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2.5 rounded-xl border-slate-200 focus-visible:ring-resurva-dark bg-white shadow-sm text-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto no-scrollbar w-max mb-6">
        {[
          { key: "Surplus", label: t.tabSurplus, icon: Layers },
          { key: "Products", label: t.tabProducts, icon: Archive },
          { key: "History", label: t.tabHistory, icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as "Surplus" | "Products" | "History")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key 
                  ? "bg-resurva-dark text-white shadow-md" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {activeTab === "Surplus" && (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-16">{t.imageCol}</TableHead>
                  <TableHead>{t.nameCol}</TableHead>
                  <TableHead>{t.categoryCol}</TableHead>
                  <TableHead className="text-right">{lang === "en" ? "Total Surplus" : "Total Surplus"}</TableHead>
                  <TableHead className="text-right">{t.priceCol} Surplus</TableHead>
                  <TableHead className="text-center">{t.marketplaceCol}</TableHead>
                  <TableHead className="text-left pl-6 w-44">{t.actionCol}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedSurplusProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      {t.emptyInventory}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedSurplusProducts.map((product) => {
                    const activeBatches = product.batches?.filter(b => !b.expiryDate || new Date(b.expiryDate).getTime() > nowTime) || [];
                    const surplusBatches = activeBatches.filter(b => isBatchSurplus(product, b));
                    const totalSurplusQty = surplusBatches.reduce((sum, b) => sum + b.qty, 0);
                    const isLowStock = product.minStock !== undefined && totalSurplusQty <= product.minStock;
                    const isExpanded = expandedProducts.has(product.id);

                    return (
                      <React.Fragment key={product.id}>
                        <TableRow className="hover:bg-slate-50/50">
                          <TableCell className="p-0 text-center">
                            <button
                              onClick={() => toggleProductExpand(product.id)}
                              className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden shrink-0">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">Img</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold text-slate-800">{product.name}</p>
                            {product.sku && <span className="text-xs text-slate-400">{product.sku}</span>}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">{product.category}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5 font-bold text-slate-800">
                              {isLowStock && (
                                <span title={t.lowStockTitle}>
                                  <AlertTriangle className="w-4 h-4 text-orange-500 animate-bounce" />
                                </span>
                              )}
                              <span>{totalSurplusQty}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            Rp {product.surplusPrice.toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={product.isPublished || false}
                                onCheckedChange={() => handleTogglePublish(product.id, product.isPublished || false)}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-left pl-6">
                            <div className="flex items-center gap-2.5">
                              <Button
                                onClick={() => setSelectedProductForBatch(product)}
                                variant="outline"
                                size="sm"
                                className="text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl px-3 font-semibold shrink-0 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                {lang === "en" ? "Stock" : "Stok"}
                              </Button>
                              
                              {/* 3-dot Button */}
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-slate-100 rounded-xl cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (activeMenuProduct?.id === product.id) {
                                      setActiveMenuProduct(null);
                                    } else {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setMenuPosition({
                                        top: rect.bottom + window.scrollY,
                                        left: rect.right - 144 + window.scrollX
                                      });
                                      setActiveMenuProduct(product);
                                    }
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500">
                                    <circle cx="12" cy="12" r="1.25"></circle>
                                    <circle cx="12" cy="5" r="1.25"></circle>
                                    <circle cx="12" cy="19" r="1.25"></circle>
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                            <TableCell colSpan={8} className="p-6 pl-14 border-t">
                              {/* Flex layout with same spacing on left and right of the separator line */}
                              <div className="flex flex-col md:flex-row gap-12 w-full">
                                {/* Left Column: Batches Tree List */}
                                <div className="flex-1 max-w-2xl w-full space-y-3">
                                  <div className="flex items-center gap-2 pl-2">
                                    <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                      {lang === "en" ? "Active Surplus Batches" : "Batch Aktif"}
                                    </h4>
                                    {/* Tooltip */}
                                    <div className="relative group inline-block cursor-pointer">
                                      <span className="text-slate-400 hover:text-slate-655 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                          <circle cx="12" cy="12" r="10"></circle>
                                          <line x1="12" y1="16" x2="12" y2="12"></line>
                                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                        </svg>
                                      </span>
                                      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:block z-25 w-[420px] bg-slate-800 text-white text-[11px] p-4 rounded-xl shadow-lg border border-slate-700 leading-relaxed font-normal normal-case">
                                        <p className="font-bold mb-1 text-slate-200">Keterangan Kolom Data (Kiri ke Kanan):</p>
                                        <ul className="list-disc pl-4 space-y-1 text-slate-300">
                                          <li><strong>Tag Batch</strong>: Format SKU-Huruf-Tanggal</li>
                                          <li><strong>Stok</strong>: Jumlah pcs yang tersedia</li>
                                          <li><strong>Harga</strong>: Harga jual aktif saat ini</li>
                                          <li><strong className="text-emerald-450 font-bold">Mulai Surplus</strong>: Tanggal diskon surplus aktif (hijau)</li>
                                          <li><strong className="text-rose-455 font-bold">Kedaluwarsa</strong>: Tanggal kedaluwarsa produk (merah)</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {surplusBatches.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic pl-4">
                                      {lang === "en" ? "No active surplus batches." : "Tidak ada batch surplus aktif."}
                                    </p>
                                  ) : (
                                    <div className="relative pl-4 space-y-1 max-w-2xl">
                                      {/* The vertical line in the tree */}
                                      <div className={`absolute left-[9px] top-2 w-[2px] bg-slate-200 ${
                                        surplusBatches.length > 5 ? "bottom-[18px]" : "bottom-[24px]"
                                      }`}></div>
                                      
                                      {surplusBatches.slice(0, 5).map((batch) => {
                                        const batchTag = getBatchTag(product, batch);
                                        const isSurplus = isBatchSurplus(product, batch);
                                        const price = isSurplus ? product.surplusPrice : product.originalPrice;
                                        const surplusDate = getBatchSurplusDate(product, batch);
                                        
                                        // Match query highlight
                                        const isQueryMatched = searchQuery.trim() !== "" && batchTag.toLowerCase().includes(searchQuery.toLowerCase().trim());
                                        
                                        return (
                                          <div key={batch.id} className="relative flex items-center py-1.5 pl-4 group">
                                            {/* The horizontal branch connector */}
                                            <div className="absolute left-[-15px] top-[22px] w-4 h-[2px] bg-slate-200"></div>
                                            
                                            {/* Batch details in row format - matches detail style with Edit/Delete action */}
                                            <div className={`flex flex-1 items-center justify-between gap-4 bg-white p-2.5 rounded-xl border shadow-sm hover:shadow-md transition-all ${isQueryMatched ? 'border-indigo-400 ring-2 ring-indigo-500/20 bg-indigo-50/10' : 'border-slate-100'}`}>
                                              <div className="flex items-center gap-3">
                                                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                                                  {batchTag}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500 shrink-0">
                                                  {batch.qty} {t.pcs}
                                                </span>
                                              </div>
                                              
                                              <div className="flex items-center gap-6 pr-1">
                                                <span className="text-xs font-bold text-slate-800 shrink-0">
                                                  Rp {price.toLocaleString("id-ID")}
                                                </span>

                                                <div className="flex flex-col text-right min-w-[110px] shrink-0">
                                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mulai Surplus</span>
                                                  <span className="text-xs font-bold text-emerald-600">
                                                    {formatExpiryDateTime(surplusDate)}
                                                  </span>
                                                </div>

                                                <div className="flex flex-col text-right min-w-[110px] shrink-0">
                                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Kedaluwarsa</span>
                                                  <span className="text-xs font-bold text-rose-600">
                                                    {formatExpiryDateTime(batch.expiryDate)}
                                                  </span>
                                                </div>

                                                {/* 3-dot Button for Batch action dropdown */}
                                                <div className="relative">
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-7 w-7 p-0 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-resurva-dark cursor-pointer"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setActiveBatchMenuId(activeBatchMenuId === batch.id ? null : batch.id);
                                                    }}
                                                  >
                                                    <MoreVertical className="w-4 h-4" />
                                                  </Button>
                                                  
                                                  {activeBatchMenuId === batch.id && (
                                                    <div 
                                                      className="absolute right-0 mt-1 w-28 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden"
                                                      onClick={(e) => e.stopPropagation()}
                                                    >
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setActiveBatchMenuId(null);
                                                          handleOpenEditBatch(product, batch);
                                                        }}
                                                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-resurva-dark flex items-center gap-1.5 cursor-pointer"
                                                      >
                                                        <Edit className="w-3 h-3" />
                                                        Edit
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setActiveBatchMenuId(null);
                                                          handleDeleteBatch(product, batch.id);
                                                        }}
                                                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-red-650 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
                                                      >
                                                        <Trash2 className="w-3 h-3" />
                                                        Hapus
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                      {surplusBatches.length > 5 && (
                                        <div className="relative flex items-center py-1.5 pl-4 mt-1">
                                          {/* The horizontal branch connector */}
                                          <div className="absolute left-[-15px] top-[14px] w-4 h-[2px] bg-slate-200"></div>
                                          <button
                                            onClick={() => router.push(`/merchant/inventory/${product.id}`)}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer pl-1.5"
                                          >
                                            {t.seeMore} &rarr;
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Right Column: Deskripsi & Kandungan (spans 4 columns on md) */}
                                <div className="flex-1 space-y-5 border-l border-slate-100 pl-12">
                                  {/* Notes/Description */}
                                  <div className="space-y-1.5">
                                    <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                      {lang === "en" ? "Notes / Description" : "Catatan / Deskripsi"}
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                      {product.description || (lang === "en" ? "No description provided." : "Tidak ada deskripsi.")}
                                    </p>
                                  </div>

                                  {/* Ingredients */}
                                  {product.ingredients && product.ingredients.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                        {lang === "en" ? "Ingredients Composition" : "Kandungan Bahan Makanan"}
                                      </h4>
                                      <div className="flex flex-wrap gap-2 pt-1">
                                        {product.ingredients.map((ing, idx) => (
                                          <div key={idx} className="flex flex-col items-center bg-slate-50 border border-slate-200/60 rounded-xl p-2 min-w-[75px] justify-center text-center">
                                            <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 mb-1">
                                              {ing.percentage}%
                                            </div>
                                            <span className="text-[9px] font-semibold text-slate-700 max-w-[80px] truncate" title={ing.carbonCategory}>
                                              {ing.carbonCategory.split(" (")[0]}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Variants */}
                                  {product.variantGroups && product.variantGroups.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                        {lang === "en" ? "Product Variants" : "Varian Produk"}
                                      </h4>
                                      <div className="flex flex-wrap gap-1.5">
                                        {product.variantGroups.map((vg) => (
                                          <Badge key={vg.id} variant="secondary" className="bg-indigo-50/30 text-indigo-700 border-indigo-100/30 py-0.5 px-2 rounded text-[10px] font-medium">
                                            {vg.name}: {vg.options.map(o => o.name).join(", ")}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "Products" && (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-16">{t.imageCol}</TableHead>
                  <TableHead>{t.nameCol}</TableHead>
                  <TableHead>{t.categoryCol}</TableHead>
                  <TableHead className="text-right">{lang === "en" ? "Est. Weight" : "Est. Berat"}</TableHead>
                  <TableHead className="text-right">{t.priceCol} Reguler</TableHead>
                  <TableHead className="text-right">{t.priceCol} Surplus</TableHead>
                  <TableHead className="text-right">{t.stockCol}</TableHead>
                  <TableHead className="text-center">{t.marketplaceCol}</TableHead>
                  <TableHead className="text-left pl-6 w-44">{t.actionCol}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                      {lang === "en" ? "No products found." : "Tidak ada produk ditemukan."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const activeBatches = product.batches?.filter(b => !b.expiryDate || new Date(b.expiryDate).getTime() > nowTime) || [];
                    const activeQty = activeBatches.reduce((sum, b) => sum + b.qty, 0);
                    const isLowStock = product.minStock !== undefined && activeQty <= product.minStock;
                    const isExpanded = expandedProducts.has(product.id);

                    return (
                      <React.Fragment key={product.id}>
                        <TableRow className="hover:bg-slate-50/50">
                          <TableCell className="p-0 text-center">
                            <button
                              onClick={() => toggleProductExpand(product.id)}
                              className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-600 animate-none" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-600 animate-none" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden shrink-0">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">Img</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold text-slate-800">{product.name}</p>
                            {product.sku && <span className="text-xs text-slate-400">{product.sku}</span>}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">{product.category}</TableCell>
                          <TableCell className="text-right text-slate-600 text-sm font-semibold">{product.weight} kg</TableCell>
                          <TableCell className="text-right font-bold text-slate-700">
                            Rp {product.originalPrice.toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            Rp {product.surplusPrice.toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5 font-bold text-slate-800">
                              {isLowStock && (
                                <span title={t.lowStockTitle}>
                                  <AlertTriangle className="w-4 h-4 text-orange-500 animate-bounce" />
                                </span>
                              )}
                              <span>{activeQty}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={product.isPublished || false}
                                onCheckedChange={() => handleTogglePublish(product.id, product.isPublished || false)}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-left pl-6">
                            <div className="flex items-center gap-2.5">
                              <Button
                                onClick={() => setSelectedProductForBatch(product)}
                                variant="outline"
                                size="sm"
                                className="text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl px-3 font-semibold shrink-0 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                {lang === "en" ? "Stock" : "Stok"}
                              </Button>
                              
                              {/* 3-dot Button */}
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-slate-100 rounded-xl cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (activeMenuProduct?.id === product.id) {
                                      setActiveMenuProduct(null);
                                    } else {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setMenuPosition({
                                        top: rect.bottom + window.scrollY,
                                        left: rect.right - 144 + window.scrollX
                                      });
                                      setActiveMenuProduct(product);
                                    }
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500">
                                    <circle cx="12" cy="12" r="1.25"></circle>
                                    <circle cx="12" cy="5" r="1.25"></circle>
                                    <circle cx="12" cy="19" r="1.25"></circle>
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                            <TableCell colSpan={10} className="p-6 pl-14 border-t">
                              {/* Flex layout with same spacing on left and right of the separator line */}
                              <div className="flex flex-col md:flex-row gap-12 w-full">
                                {/* Left Column: Batches Tree List */}
                                <div className="flex-1 max-w-2xl w-full space-y-3">
                                  <div className="flex items-center gap-2 pl-2">
                                    <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                      {lang === "en" ? "Active Batches" : "Batch Aktif"}
                                    </h4>
                                    {/* Tooltip */}
                                    <div className="relative group inline-block cursor-pointer">
                                      <span className="text-slate-400 hover:text-slate-650 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                          <circle cx="12" cy="12" r="10"></circle>
                                          <line x1="12" y1="16" x2="12" y2="12"></line>
                                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                        </svg>
                                      </span>
                                      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:block z-25 w-[420px] bg-slate-800 text-white text-[11px] p-4 rounded-xl shadow-lg border border-slate-700 leading-relaxed font-normal normal-case">
                                        <p className="font-bold mb-1 text-slate-200">Keterangan Kolom Data (Kiri ke Kanan):</p>
                                        <ul className="list-disc pl-4 space-y-1 text-slate-300">
                                          <li><strong>Tag Batch</strong>: Format SKU-Huruf-Tanggal</li>
                                          <li><strong>Stok</strong>: Jumlah pcs yang tersedia</li>
                                          <li><strong>Harga</strong>: Harga jual aktif saat ini</li>
                                          <li><strong className="text-emerald-450 font-bold">Mulai Surplus</strong>: Tanggal diskon surplus aktif (hijau)</li>
                                          <li><strong className="text-rose-455 font-bold">Kedaluwarsa</strong>: Tanggal kedaluwarsa produk (merah)</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {activeBatches.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic pl-4">
                                      {lang === "en" ? "No active batches." : "Tidak ada batch aktif."}
                                    </p>
                                  ) : (
                                    <div className="relative pl-4 space-y-1 max-w-2xl">
                                      {/* The vertical line in the tree */}
                                      <div className={`absolute left-[9px] top-2 w-[2px] bg-slate-200 ${
                                        activeBatches.length > 5 ? "bottom-[18px]" : "bottom-[24px]"
                                      }`}></div>
                                      
                                      {activeBatches.slice(0, 5).map((batch) => {
                                        const batchTag = getBatchTag(product, batch);
                                        const isSurplus = isBatchSurplus(product, batch);
                                        const price = isSurplus ? product.surplusPrice : product.originalPrice;
                                        const surplusDate = getBatchSurplusDate(product, batch);
                                        
                                        // Match query highlight
                                        const isQueryMatched = searchQuery.trim() !== "" && batchTag.toLowerCase().includes(searchQuery.toLowerCase().trim());
                                        
                                        return (
                                          <div key={batch.id} className="relative flex items-center py-1.5 pl-4 group">
                                            {/* The horizontal branch connector */}
                                            <div className="absolute left-[-15px] top-[22px] w-4 h-[2px] bg-slate-200"></div>
                                            
                                            {/* Batch details in row format - matches detail style with Edit/Delete action */}
                                            <div className={`flex flex-1 items-center justify-between gap-4 bg-white p-2.5 rounded-xl border shadow-sm hover:shadow-md transition-all ${isQueryMatched ? 'border-indigo-400 ring-2 ring-indigo-500/20 bg-indigo-50/10' : 'border-slate-100'}`}>
                                              <div className="flex items-center gap-3">
                                                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                                                  {batchTag}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500 shrink-0">
                                                  {batch.qty} {t.pcs}
                                                </span>
                                              </div>
                                              
                                              <div className="flex items-center gap-6 pr-1">
                                                <span className="text-xs font-bold text-slate-800 shrink-0">
                                                  Rp {price.toLocaleString("id-ID")}
                                                </span>

                                                <div className="flex flex-col text-right min-w-[110px] shrink-0">
                                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mulai Surplus</span>
                                                  <span className="text-xs font-bold text-emerald-600">
                                                    {formatExpiryDateTime(surplusDate)}
                                                  </span>
                                                </div>

                                                <div className="flex flex-col text-right min-w-[110px] shrink-0">
                                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Kedaluwarsa</span>
                                                  <span className="text-xs font-bold text-rose-600">
                                                    {formatExpiryDateTime(batch.expiryDate)}
                                                  </span>
                                                </div>

                                                {/* 3-dot Button for Batch action dropdown */}
                                                <div className="relative">
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-7 w-7 p-0 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-resurva-dark cursor-pointer"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setActiveBatchMenuId(activeBatchMenuId === batch.id ? null : batch.id);
                                                    }}
                                                  >
                                                    <MoreVertical className="w-4 h-4" />
                                                  </Button>
                                                  
                                                  {activeBatchMenuId === batch.id && (
                                                    <div 
                                                      className="absolute right-0 mt-1 w-28 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden"
                                                      onClick={(e) => e.stopPropagation()}
                                                    >
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setActiveBatchMenuId(null);
                                                          handleOpenEditBatch(product, batch);
                                                        }}
                                                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-resurva-dark flex items-center gap-1.5 cursor-pointer"
                                                      >
                                                        <Edit className="w-3 h-3" />
                                                        Edit
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setActiveBatchMenuId(null);
                                                          handleDeleteBatch(product, batch.id);
                                                        }}
                                                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-red-655 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
                                                      >
                                                        <Trash2 className="w-3 h-3" />
                                                        Hapus
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                      {activeBatches.length > 5 && (
                                        <div className="relative flex items-center py-1.5 pl-4 mt-1">
                                          {/* The horizontal branch connector */}
                                          <div className="absolute left-[-15px] top-[14px] w-4 h-[2px] bg-slate-200"></div>
                                          <button
                                            onClick={() => router.push(`/merchant/inventory/${product.id}`)}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer pl-1.5"
                                          >
                                            {t.seeMore} &rarr;
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Right Column: Deskripsi & Kandungan (spans 4 columns on md) */}
                                <div className="flex-1 space-y-5 border-l border-slate-100 pl-12">
                                  {/* Notes/Description */}
                                  <div className="space-y-1.5">
                                    <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                      {lang === "en" ? "Notes / Description" : "Catatan / Deskripsi"}
                                    </h4>
                                    <p className="text-sm text-slate-650 leading-relaxed">
                                      {product.description || (lang === "en" ? "No description provided." : "Tidak ada deskripsi.")}
                                    </p>
                                  </div>

                                  {/* Ingredients */}
                                  {product.ingredients && product.ingredients.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                        {lang === "en" ? "Ingredients Composition" : "Kandungan Bahan Makanan"}
                                      </h4>
                                      <div className="flex flex-wrap gap-2 pt-1">
                                        {product.ingredients.map((ing, idx) => (
                                          <div key={idx} className="flex flex-col items-center bg-slate-50 border border-slate-200/60 rounded-xl p-2 min-w-[75px] justify-center text-center">
                                            <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 mb-1">
                                              {ing.percentage}%
                                            </div>
                                            <span className="text-[9px] font-semibold text-slate-700 max-w-[80px] truncate" title={ing.carbonCategory}>
                                              {ing.carbonCategory.split(" (")[0]}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Variants */}
                                  {product.variantGroups && product.variantGroups.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                        {lang === "en" ? "Product Variants" : "Varian Produk"}
                                      </h4>
                                      <div className="flex flex-wrap gap-1.5">
                                        {product.variantGroups.map((vg) => (
                                          <Badge key={vg.id} variant="secondary" className="bg-indigo-50/30 text-indigo-700 border-indigo-100/30 py-0.5 px-2 rounded text-[10px] font-medium">
                                            {vg.name}: {vg.options.map(o => o.name).join(", ")}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "History" && (
            <div className="space-y-4 p-6 bg-slate-50/50">
              {/* Filter controls */}
              <div className="flex flex-wrap gap-4 items-center justify-between border-b pb-4 border-slate-100">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wide">
                    {lang === "en" ? "Filters:" : "Filter:"}
                  </span>
                  
                  {/* Type Filter Button Group */}
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                    {(["Semua", "Masuk", "Keluar"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFilterType(t)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          filterType === t
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {t === "Semua" ? (lang === "en" ? "All Type" : "Semua Tipe") : t}
                      </button>
                    ))}
                  </div>

                  {/* Reason Filter Button Group */}
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                    {(["Semua", "Transaksi Jual Beli", "Kadaluarsa", "Adjustment"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFilterReason(r)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          filterReason === r
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {r === "Semua" 
                          ? (lang === "en" ? "All Reasons" : "Semua Alasan") 
                          : r === "Transaksi Jual Beli" 
                            ? (lang === "en" ? "Transaction" : "Transaksi")
                            : r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-500 bg-white border px-3 py-1.5 rounded-xl shadow-sm">
                  {lang === "en" ? "Total logs:" : "Total riwayat:"}{" "}
                  <span className="font-bold text-slate-800">{filteredLogs.length}</span>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="w-[180px] font-bold text-slate-600 text-xs">
                        {lang === "en" ? "Date & Time" : "Tanggal & Waktu"}
                      </TableHead>
                      <TableHead className="font-bold text-slate-600 text-xs">
                        {lang === "en" ? "Product Name & SKU" : "Nama Produk & SKU"}
                      </TableHead>
                      <TableHead className="w-[150px] font-bold text-slate-600 text-xs">
                        {lang === "en" ? "Batch Tag" : "Tag Batch"}
                      </TableHead>
                      <TableHead className="w-[100px] font-bold text-slate-600 text-xs">
                        {lang === "en" ? "Type" : "Jenis"}
                      </TableHead>
                      <TableHead className="w-[100px] text-right font-bold text-slate-600 text-xs pr-4">
                        {lang === "en" ? "Qty" : "Jumlah"}
                      </TableHead>
                      <TableHead className="w-[180px] font-bold text-slate-600 text-xs pl-6">
                        {lang === "en" ? "Category" : "Keterangan"}
                      </TableHead>
                      <TableHead className="font-bold text-slate-600 text-xs pl-6">
                        {lang === "en" ? "Reference / Details" : "Referensi / Detail"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                          <History className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                          {lang === "en" 
                            ? "No stock movement logs match the filters." 
                            : "Tidak ada riwayat keluar masuk stock yang cocok dengan filter."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => {
                        const dateFormatted = new Date(log.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        });
                        const isMasuk = log.quantity > 0;

                        return (
                          <TableRow key={log.id} className="hover:bg-slate-50/40 border-b border-slate-100/80">
                            <TableCell className="font-medium text-xs text-slate-500 font-mono">
                              {dateFormatted}
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-slate-800 block">{log.productName ?? products.find(p => p.id === log.productId)?.name ?? log.productId}</span>
                              {(log.sku ?? products.find(p => p.id === log.productId)?.sku) && <span className="text-[10px] font-bold text-slate-400 font-mono">{log.sku ?? products.find(p => p.id === log.productId)?.sku}</span>}
                            </TableCell>
                            <TableCell>
                              {log.batchTag ? (
                                <span className="font-mono text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0 border border-slate-200/60 shadow-sm" title={lang === "en" ? "Batch Tag" : "Tag Batch"}>
                                  {log.batchTag}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {isMasuk ? (
                                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100/50 rounded-lg text-[10px] font-bold px-2 py-0.5 shadow-none">
                                  {lang === "en" ? "In" : "Masuk"}
                                </Badge>
                              ) : (
                                <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-100/50 rounded-lg text-[10px] font-bold px-2 py-0.5 shadow-none">
                                  {lang === "en" ? "Out" : "Keluar"}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className={`text-right font-bold text-xs font-mono pr-4 ${isMasuk ? "text-emerald-600" : "text-rose-600"}`}>
                              {isMasuk ? `+${log.qty ?? Math.abs(log.quantity)}` : `-${log.qty ?? Math.abs(log.quantity)}`} pcs
                            </TableCell>
                            <TableCell className="pl-6">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                                log.reason === "Transaksi Jual Beli"
                                  ? "bg-blue-50 text-blue-700"
                                  : log.reason === "Kadaluarsa"
                                    ? "bg-rose-50 text-rose-700 border border-rose-100/30"
                                    : "bg-slate-100 text-slate-700"
                              }`}>
                                {log.reason}
                              </span>
                            </TableCell>
                            <TableCell className="text-slate-600 text-xs font-medium pl-6">
                              {log.reference || "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating 3-dot Dropdown Menu */}
      {activeMenuProduct && menuPosition && (
        <div 
          className="absolute bg-white border border-slate-150 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden w-36 shadow-slate-200/80 animate-in fade-in slide-in-from-top-1 duration-100 font-sans"
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setActiveMenuProduct(null);
              router.push(`/merchant/inventory/${activeMenuProduct.id}`);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-650 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            Detail
          </button>
          <button
            onClick={() => {
              setActiveMenuProduct(null);
              handleEdit(activeMenuProduct);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-650 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => {
              setActiveMenuProduct(null);
              if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
                deleteProduct(activeMenuProduct.id);
              }
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-650 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </button>
        </div>
      )}

      {/* Category CRUD Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">{t.catModalTitle}</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {/* Add form */}
              <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
                <Input
                  placeholder={t.newCatPlaceholder}
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
                <Button type="submit" className="bg-resurva-dark hover:bg-resurva-dark-light text-white rounded-xl">
                  {t.addCatBtn}
                </Button>
              </form>

              {/* Categories list */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-2 border rounded-xl bg-slate-50/50">
                    <span className="text-sm font-semibold text-slate-800">{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Batch / Stock Modal */}
      {selectedProductForBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-5 border-b bg-indigo-550/10 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">
                {t.addBatchModalTitle} <span className="text-indigo-700">"{selectedProductForBatch.name}"</span>
              </h3>
              <button onClick={() => setSelectedProductForBatch(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddBatchSubmit} className="p-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batchQty">{t.qtyLabel}</Label>
                <Input
                  id="batchQty"
                  type="number"
                  min={1}
                  value={batchQty}
                  onChange={(e) => setBatchQty(Number(e.target.value))}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchExpiry">{t.expiryLabel}</Label>
                <Input
                  id="batchExpiry"
                  type="datetime-local"
                  value={batchExpiry}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              {/* Set Surplus Start Date Switch */}
              <div className="flex items-center space-x-2 pt-1.5">
                <Switch
                  id="customSurplusDateEnabled"
                  checked={customSurplusDateEnabled}
                  onCheckedChange={(checked) => {
                    setCustomSurplusDateEnabled(checked);
                    if (checked && batchExpiry && selectedProductForBatch?.surplusTriggerHours) {
                      const expiryTime = new Date(batchExpiry).getTime();
                      const surplusTime = new Date(expiryTime - selectedProductForBatch.surplusTriggerHours * 60 * 60 * 1000);
                      const s_yyyy = surplusTime.getFullYear();
                      const s_mm = String(surplusTime.getMonth() + 1).padStart(2, "0");
                      const s_dd = String(surplusTime.getDate()).padStart(2, "0");
                      const s_hh = String(surplusTime.getHours()).padStart(2, "0");
                      const s_min = String(surplusTime.getMinutes()).padStart(2, "0");
                      setBatchSurplusDate(`${s_yyyy}-${s_mm}-${s_dd}T${s_hh}:${s_min}`);
                    } else if (!checked) {
                      setBatchSurplusDate("");
                    }
                  }}
                />
                <Label htmlFor="customSurplusDateEnabled" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Atur Tanggal Mulai Surplus
                </Label>
              </div>

              {customSurplusDateEnabled && (
                <div className="space-y-2 pt-1 animate-none">
                  <Label htmlFor="batchSurplusDate" className="flex items-center gap-1 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal & Jam Mulai Surplus
                  </Label>
                  <Input
                    id="batchSurplusDate"
                    type="datetime-local"
                    value={batchSurplusDate}
                    onChange={(e) => setBatchSurplusDate(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm"
                    required
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setSelectedProductForBatch(null)}>
                  {t.cancelBtn}
                </Button>
                <Button type="submit" className="bg-resurva-dark hover:bg-resurva-dark-light text-white rounded-xl">
                  {t.saveBtn}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-5 border-b bg-emerald-50/20 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">
                Edit Batch <span className="text-resurva-dark">"{getBatchTag(editingBatchProduct!, editingBatch)}"</span>
              </h3>
              <button onClick={() => { setEditingBatch(null); setEditingBatchProduct(null); }} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleEditBatchSubmit} className="p-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editBatchQty">Jumlah / Stok</Label>
                <Input
                  id="editBatchQty"
                  type="number"
                  min={1}
                  value={editingBatchQty}
                  onChange={(e) => setEditingBatchQty(Number(e.target.value))}
                  className="rounded-xl border-slate-200 focus-visible:ring-resurva-dark"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editBatchExpiry">Tanggal & Jam Kedaluwarsa</Label>
                <Input
                  id="editBatchExpiry"
                  type="datetime-local"
                  value={editingBatchExpiry}
                  onChange={(e) => handleEditExpiryChange(e.target.value)}
                  className="rounded-xl border-slate-200 focus-visible:ring-resurva-dark"
                  required
                />
              </div>

              {/* Set Surplus Start Date Switch */}
              <div className="flex items-center space-x-2 pt-1.5">
                <Switch
                  id="editCustomSurplusDateEnabled"
                  checked={editingBatchSurplusDateEnabled}
                  onCheckedChange={(checked) => {
                    setEditingBatchSurplusDateEnabled(checked);
                    if (checked && editingBatchExpiry && editingBatchProduct?.surplusTriggerHours) {
                      const expiryTime = new Date(editingBatchExpiry).getTime();
                      const surplusTime = new Date(expiryTime - editingBatchProduct.surplusTriggerHours * 60 * 60 * 1000);
                      const s_yyyy = surplusTime.getFullYear();
                      const s_mm = String(surplusTime.getMonth() + 1).padStart(2, "0");
                      const s_dd = String(surplusTime.getDate()).padStart(2, "0");
                      const s_hh = String(surplusTime.getHours()).padStart(2, "0");
                      const s_min = String(surplusTime.getMinutes()).padStart(2, "0");
                      setEditingBatchSurplusDate(`${s_yyyy}-${s_mm}-${s_dd}T${s_hh}:${s_min}`);
                    } else if (!checked) {
                      setEditingBatchSurplusDate("");
                    }
                  }}
                />
                <Label htmlFor="editCustomSurplusDateEnabled" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Atur Tanggal Mulai Surplus
                </Label>
              </div>

              {editingBatchSurplusDateEnabled && (
                <div className="space-y-2 pt-1 animate-none">
                  <Label htmlFor="editBatchSurplusDate" className="flex items-center gap-1 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal & Jam Mulai Surplus
                  </Label>
                  <Input
                    id="editBatchSurplusDate"
                    type="datetime-local"
                    value={editingBatchSurplusDate}
                    onChange={(e) => setEditingBatchSurplusDate(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm focus-visible:ring-resurva-dark"
                    required
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" className="rounded-xl cursor-pointer" onClick={() => { setEditingBatch(null); setEditingBatchProduct(null); }}>
                  {t.cancelBtn}
                </Button>
                <Button type="submit" className="bg-resurva-dark hover:bg-resurva-dark-light text-white rounded-xl cursor-pointer">
                  {t.saveBtn}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={productToEdit}
      />

      <MobilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
