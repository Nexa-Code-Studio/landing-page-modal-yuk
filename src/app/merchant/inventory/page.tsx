"use client";

import React, { useState, useEffect } from "react";
import { useMerchantContext, Product, ProductBatch } from "@/lib/contexts/MerchantContext";
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
import { Edit, Trash2, Smartphone, AlertTriangle, Archive, FileDown, Layers, Plus, Calendar, Settings } from "lucide-react";
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
    expiryCol: "Expiry (Min - Max)",
    marketplaceCol: "Marketplace",
    actionCol: "Action",
    emptyInventory: "No products found in this category.",
    lowStockTitle: "Low Stock",
    safeLabel: "Safe (> 3 Days)",
    surplusLabel: "Surplus (1-3 Days)",
    flashSaleLabel: "Flash Sale (< 24h)",
    regulerLabel: "Regular",
    tabSurplus: "Surplus",
    tabReguler: "Regular",
    tabArsip: "Archived (Expired)",
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
    expiryCol: "Kedaluwarsa (Min - Max)",
    marketplaceCol: "Marketplace",
    actionCol: "Aksi",
    emptyInventory: "Tidak ada produk di kategori ini.",
    lowStockTitle: "Stok Menipis",
    safeLabel: "Aman (> 3 Hari)",
    surplusLabel: "Surplus (1-3 Hari)",
    flashSaleLabel: "Flash Sale (< 24j)",
    regulerLabel: "Reguler",
    tabSurplus: "Surplus",
    tabReguler: "Reguler",
    tabArsip: "Arsip (Kedaluwarsa)",
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
  }
};

export default function InventoryPage() {
  const {
    products, deleteProduct, updateProduct,
    categories, addCategory, updateCategory, deleteCategory
  } = useMerchantContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "id">("en");
  const [activeTab, setActiveTab] = useState<"Surplus" | "Reguler" | "Arsip">("Surplus");

  // Category CRUD Modal state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editingCatVal, setEditingCatVal] = useState("");

  // Add Batch Modal state
  const [selectedProductForBatch, setSelectedProductForBatch] = useState<Product | null>(null);
  const [batchQty, setBatchQty] = useState(10);
  const [batchType, setBatchType] = useState<"Reguler" | "Surplus">("Reguler");
  const [batchExpiry, setBatchExpiry] = useState("");

  // Load language preference from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage") as "en" | "id" | null;
    if (savedLang) {
      setLang(savedLang);
    } else {
      const systemLang = navigator.language.startsWith("id") ? "id" : "en";
      setLang(systemLang);
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
  const nowTime = Date.now();

  // Helper function to calculate remaining days
  function calculateStatus(expiryDateISO?: string) {
    if (!expiryDateISO) {
      return { label: t.regulerLabel, variant: "outline", colorClass: "bg-slate-100 text-slate-800 border-slate-200" };
    }
    const expiry = new Date(expiryDateISO).getTime();
    const diffHours = (expiry - nowTime) / (1000 * 60 * 60);

    if (diffHours <= 24) {
      return { label: t.flashSaleLabel, variant: "destructive", colorClass: "bg-red-100 text-red-800 hover:bg-red-200" };
    } else if (diffHours <= 24 * 3) {
      return { label: t.surplusLabel, variant: "secondary", colorClass: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" };
    } else {
      return { label: t.safeLabel, variant: "default", colorClass: "bg-green-100 text-green-800 hover:bg-green-200" };
    }
  }

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

  // Get range of expiry dates for product
  const getExpiryRangeStr = (product: Product) => {
    const activeBatches = product.batches?.filter(b => b.menuType === "Surplus" && b.expiryDate && new Date(b.expiryDate).getTime() > nowTime) || [];
    if (activeBatches.length === 0) return "-";

    const dates = activeBatches.map(b => new Date(b.expiryDate!).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    const formatDate = (d: Date) => d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" });

    if (formatDate(minDate) === formatDate(maxDate)) {
      return formatDate(minDate);
    }
    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  };

  // Add Category handler
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName("");
    }
  };

  // Edit Category handler
  const handleEditCategorySubmit = (name: string) => {
    if (editingCatVal.trim() && editingCatVal.trim() !== name) {
      updateCategory(name, editingCatVal.trim());
      setEditingCatName(null);
    }
  };

  // Add Batch handler
  const handleAddBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForBatch) return;

    const newBatch: ProductBatch = {
      id: `batch-${Date.now()}`,
      qty: batchQty,
      menuType: batchType,
      expiryDate: batchType === "Surplus" && batchExpiry ? new Date(batchExpiry).toISOString() : undefined
    };

    const currentBatches = selectedProductForBatch.batches || [];
    const updatedBatches = [...currentBatches, newBatch];

    // Recalculate quantity of active batches
    const activeQty = updatedBatches
      .filter(b => !b.expiryDate || new Date(b.expiryDate).getTime() > nowTime)
      .reduce((sum, b) => sum + b.qty, 0);

    updateProduct(selectedProductForBatch.id, {
      batches: updatedBatches,
      quantity: activeQty
    });

    setSelectedProductForBatch(null);
    setBatchQty(10);
    setBatchExpiry("");
  };

  // Filter products by tab
  const displayedProducts = products.filter(product => {
    const activeBatches = product.batches?.filter(b => !b.expiryDate || new Date(b.expiryDate).getTime() > nowTime) || [];
    if (activeTab === "Surplus") {
      return activeBatches.some(b => b.menuType === "Surplus");
    }
    if (activeTab === "Reguler") {
      return activeBatches.some(b => b.menuType === "Reguler");
    }
    return false;
  });

  // Extract all expired batches from all products for Arsip tab
  const expiredBatchesList = products.flatMap(product => {
    const expiredBatches = product.batches?.filter(b => b.expiryDate && new Date(b.expiryDate).getTime() <= nowTime) || [];
    return expiredBatches.map(batch => ({
      product,
      batch
    }));
  });

  return (
    <div className="space-y-6 p-4 md:p-8">
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

      {/* Tabs */}
      <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto no-scrollbar w-max mb-6">
        {[
          { key: "Surplus", label: t.tabSurplus, icon: Layers },
          { key: "Reguler", label: t.tabReguler, icon: FileDown },
          { key: "Arsip", label: t.tabArsip, icon: Archive }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
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
                  <TableHead className="w-16">{t.imageCol}</TableHead>
                  <TableHead>{t.nameCol}</TableHead>
                  <TableHead>{t.categoryCol}</TableHead>
                  <TableHead className="text-right">{t.stockCol}</TableHead>
                  <TableHead className="text-right">{t.priceCol} Surplus</TableHead>
                  <TableHead>{t.expiryCol}</TableHead>
                  <TableHead className="text-center">{t.marketplaceCol}</TableHead>
                  <TableHead className="text-right">{t.actionCol}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      {t.emptyInventory}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedProducts.map((product) => {
                    const activeBatches = product.batches?.filter(b => !b.expiryDate || new Date(b.expiryDate).getTime() > nowTime) || [];
                    const activeQty = activeBatches.reduce((sum, b) => sum + b.qty, 0);
                    const expiryRange = getExpiryRangeStr(product);
                    const isLowStock = product.minStock !== undefined && activeQty <= product.minStock;

                    return (
                      <TableRow key={product.id} className="hover:bg-slate-50/50">
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
                          {product.sku && <p className="text-xs text-slate-400 mt-0.5">{product.sku}</p>}
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">{product.category}</TableCell>
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
                        <TableCell className="text-right font-bold text-green-600">
                          Rp {product.surplusPrice.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm font-semibold">{expiryRange}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={product.isPublished || false}
                              onCheckedChange={() => handleTogglePublish(product.id, product.isPublished || false)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              onClick={() => setSelectedProductForBatch(product)}
                              variant="outline"
                              size="sm"
                              className="text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              {lang === "en" ? "Stock" : "Stok"}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100" onClick={() => handleEdit(product)}>
                              <Edit className="w-4 h-4 text-slate-500 hover:text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100" onClick={() => deleteProduct(product.id)}>
                              <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "Reguler" && (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16">{t.imageCol}</TableHead>
                  <TableHead>{t.nameCol}</TableHead>
                  <TableHead>{t.categoryCol}</TableHead>
                  <TableHead className="text-right">{t.stockCol}</TableHead>
                  <TableHead className="text-right">{t.priceCol} Reguler</TableHead>
                  <TableHead className="text-center">{t.marketplaceCol}</TableHead>
                  <TableHead className="text-right">{t.actionCol}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      {t.emptyInventory}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedProducts.map((product) => {
                    const activeBatches = product.batches?.filter(b => !b.expiryDate || new Date(b.expiryDate).getTime() > nowTime) || [];
                    const activeQty = activeBatches.reduce((sum, b) => sum + b.qty, 0);
                    const isLowStock = product.minStock !== undefined && activeQty <= product.minStock;

                    return (
                      <TableRow key={product.id} className="hover:bg-slate-50/50">
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
                          {product.sku && <p className="text-xs text-slate-400 mt-0.5">{product.sku}</p>}
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">{product.category}</TableCell>
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
                        <TableCell className="text-right font-bold text-green-600">
                          Rp {product.originalPrice.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={product.isPublished || false}
                              onCheckedChange={() => handleTogglePublish(product.id, product.isPublished || false)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              onClick={() => setSelectedProductForBatch(product)}
                              variant="outline"
                              size="sm"
                              className="text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              {lang === "en" ? "Stock" : "Stok"}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100" onClick={() => handleEdit(product)}>
                              <Edit className="w-4 h-4 text-slate-500 hover:text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100" onClick={() => deleteProduct(product.id)}>
                              <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "Arsip" && (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16">{t.imageCol}</TableHead>
                  <TableHead>{t.nameCol}</TableHead>
                  <TableHead>{t.categoryCol}</TableHead>
                  <TableHead>{t.batchIdCol}</TableHead>
                  <TableHead className="text-right">{t.expiredQtyCol}</TableHead>
                  <TableHead className="text-right">{t.priceCol}</TableHead>
                  <TableHead>{t.expiredDateCol}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiredBatchesList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      {lang === "en" ? "No expired batches in archive." : "Tidak ada batch kedaluwarsa di arsip."}
                    </TableCell>
                  </TableRow>
                ) : (
                  expiredBatchesList.map(({ product, batch }, idx) => {
                    const expiryDateStr = batch.expiryDate ? new Date(batch.expiryDate).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : "-";

                    return (
                      <TableRow key={idx} className="hover:bg-red-50/20 bg-red-50/10">
                        <TableCell>
                          <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden shrink-0">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">Img</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-slate-800">{product.name}</p>
                          {product.sku && <p className="text-xs text-slate-400 mt-0.5">{product.sku}</p>}
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">{product.category}</TableCell>
                        <TableCell className="text-slate-600 text-xs font-mono">{batch.id}</TableCell>
                        <TableCell className="text-right font-bold text-red-650">
                          {batch.qty} {t.pcs}
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-700">
                          Rp {product.surplusPrice.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">{expiryDateStr}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

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
                    {editingCatName === cat ? (
                      <div className="flex gap-2 flex-1 items-center">
                        <Input
                          value={editingCatVal}
                          onChange={(e) => setEditingCatVal(e.target.value)}
                          className="h-8 text-xs rounded-lg"
                        />
                        <Button size="sm" onClick={() => handleEditCategorySubmit(cat)} className="h-8 bg-green-600 text-white rounded-lg">
                          {t.saveBtn}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingCatName(null)} className="h-8 text-slate-400 rounded-lg">
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-semibold text-slate-800">{cat}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditingCatName(cat); setEditingCatVal(cat); }}
                            className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 hover:text-indigo-600"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteCategory(cat)}
                            className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
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
                <Label htmlFor="batchType">{t.typeLabel}</Label>
                <select
                  id="batchType"
                  value={batchType}
                  onChange={(e) => setBatchType(e.target.value as any)}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="Reguler">Reguler</option>
                  <option value="Surplus">Surplus</option>
                </select>
              </div>

              {batchType === "Surplus" && (
                <div className="space-y-2">
                  <Label htmlFor="batchExpiry" className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" /> {t.expiryLabel}
                  </Label>
                  <Input
                    id="batchExpiry"
                    type="datetime-local"
                    value={batchExpiry}
                    onChange={(e) => setBatchExpiry(e.target.value)}
                    className="rounded-xl border-slate-200"
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
