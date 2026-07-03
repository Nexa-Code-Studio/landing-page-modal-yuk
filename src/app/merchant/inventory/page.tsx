"use client";

import React, { useState, useEffect } from "react";
import { useMerchantContext, Product } from "@/lib/contexts/MerchantContext";
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
import { Switch } from "@/components/ui/switch";
import { AddProductModal } from "@/components/merchant/AddProductModal";
import { MobilePreviewModal } from "@/components/merchant/MobilePreviewModal";
import { Edit, Trash2, Smartphone, AlertTriangle } from "lucide-react";

// Helper function to calculate remaining days
function calculateStatus(expiryDateISO?: string) {
  if (!expiryDateISO) {
    return { label: "Reguler", variant: "outline", colorClass: "bg-slate-100 text-slate-800 border-slate-200" };
  }
  const expiry = new Date(expiryDateISO).getTime();
  const now = new Date().getTime();
  const diffHours = (expiry - now) / (1000 * 60 * 60);

  if (diffHours <= 24) {
    return { label: "Flash Sale (< 24j)", variant: "destructive", colorClass: "bg-red-100 text-red-800 hover:bg-red-200" };
  } else if (diffHours <= 24 * 3) {
    return { label: "Surplus (1-3 Hari)", variant: "secondary", colorClass: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" };
  } else {
    return { label: "Aman (> 3 Hari)", variant: "default", colorClass: "bg-green-100 text-green-800 hover:bg-green-200" };
  }
}

const TRANSLATIONS = {
  en: {
    title: "Real-Time Expiry Tracker",
    description: "Manage your inventory and monitor food expiration automatically.",
    previewApp: "Preview App",
    addProduct: "Add Product",
    imageCol: "Image",
    nameCol: "Product Name & SKU",
    categoryCol: "Category",
    stockCol: "Stock",
    surplusPriceCol: "Surplus Price",
    expiryCol: "Expiry Date",
    statusCol: "Status",
    marketplaceCol: "Marketplace",
    actionCol: "Action",
    emptyInventory: "No products in inventory yet.",
    lowStockTitle: "Low Stock",
    safeLabel: "Safe (> 3 Days)",
    surplusLabel: "Surplus (1-3 Days)",
    flashSaleLabel: "Flash Sale (< 24h)",
    regulerLabel: "Regular",
  },
  id: {
    title: "Real-Time Expiry Tracker",
    description: "Kelola inventaris Anda dan pantau tanggal kedaluwarsa secara otomatis.",
    previewApp: "Preview App",
    addProduct: "Tambah Produk",
    imageCol: "Gambar",
    nameCol: "Nama Produk & SKU",
    categoryCol: "Kategori",
    stockCol: "Stok",
    surplusPriceCol: "Harga Surplus",
    expiryCol: "Tgl Kedaluwarsa",
    statusCol: "Status",
    marketplaceCol: "Marketplace",
    actionCol: "Aksi",
    emptyInventory: "Belum ada produk di inventaris.",
    lowStockTitle: "Stok Menipis",
    safeLabel: "Aman (> 3 Hari)",
    surplusLabel: "Surplus (1-3 Hari)",
    flashSaleLabel: "Flash Sale (< 24j)",
    regulerLabel: "Reguler",
  }
};

export default function InventoryPage() {
  const { products, deleteProduct, updateProduct } = useMerchantContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "id">("en");

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

  // Helper function to calculate remaining days with translated labels
  function calculateStatus(expiryDateISO?: string) {
    if (!expiryDateISO) {
      return { label: t.regulerLabel, variant: "outline", colorClass: "bg-slate-100 text-slate-800 border-slate-200" };
    }
    const expiry = new Date(expiryDateISO).getTime();
    const now = new Date().getTime();
    const diffHours = (expiry - now) / (1000 * 60 * 60);

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

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">{t.title}</h2>
          <p className="text-slate-500 text-sm">
            {t.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsPreviewOpen(true)} variant="outline" className="border-resurva-dark text-resurva-dark hover:bg-resurva-green-muted rounded-xl">
            <Smartphone className="w-4 h-4 mr-2" />
            {t.previewApp}
          </Button>
          <Button onClick={handleAddNew} className="bg-resurva-dark hover:bg-resurva-dark-light text-white rounded-xl font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {t.addProduct}
          </Button>
        </div>
      </div>

      <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16">{t.imageCol}</TableHead>
                <TableHead>{t.nameCol}</TableHead>
                <TableHead>{t.categoryCol}</TableHead>
                <TableHead className="text-right">{t.stockCol}</TableHead>
                <TableHead className="text-right">{t.surplusPriceCol}</TableHead>
                <TableHead>{t.expiryCol}</TableHead>
                <TableHead>{t.statusCol}</TableHead>
                <TableHead className="text-center">{t.marketplaceCol}</TableHead>
                <TableHead className="text-right">{t.actionCol}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                    {t.emptyInventory}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const status = calculateStatus(product.expiryDate);
                  const expiryDateStr = product.expiryDate ? new Date(product.expiryDate).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : "-";

                  const isLowStock = product.minStock !== undefined && product.quantity <= product.minStock;

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
                        <div className="flex items-center justify-end gap-1.5">
                          {isLowStock && (
                            <span title={t.lowStockTitle}>
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                            </span>
                          )}
                          <span className={isLowStock ? "text-orange-600 font-bold" : "text-slate-800 font-medium"}>{product.quantity}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        Rp {product.surplusPrice.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">{expiryDateStr}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${status.colorClass} border-none font-bold text-[10px]`}>
                          {status.label}
                        </Badge>
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
        </div>
      </div>

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
