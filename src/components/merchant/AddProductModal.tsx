"use client";

import React, { useState, useEffect } from "react";
import { useMerchantContext, Product, VariantGroup, VariantOption, ProductIngredient } from "@/lib/contexts/MerchantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Info, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const CARBON_CATEGORIES = [
  "Beef (beef herd)",
  "Lamb & Mutton",
  "Beef (dairy herd)",
  "Crustaceans (Farmed - Udang/Kepiting)",
  "Pig Meat",
  "Fish (Farmed)",
  "Poultry Meat (Ayam/Unggas)",
  "Eggs",
  "Cheese",
  "Milk (Cow)",
  "Tofu (Kedelai)",
  "Groundnuts (Kacang Tanah)",
  "Other Pulses (Kacang-kacangan lain)",
  "Peas (Kacang Polong)",
  "Nuts (Kacang Pohon)",
  "Rice (Flooded)",
  "Oatmeal",
  "Wheat & Rye (Bread)",
  "Maize (Jagung)",
  "Cassava (Singkong)",
  "Potatoes (Kentang)",
  "Palm Oil",
  "Soybean Oil",
  "Olive Oil",
  "Rapeseed Oil",
  "Sunflower Oil",
  "Tomatoes",
  "Brassicas (Kubis/Brokoli)",
  "Onions & Leeks",
  "Root Vegetables",
  "Berries & Grapes",
  "Bananas",
  "Apples",
  "Citrus Fruit",
  "Cane Sugar",
  "Beet Sugar",
  "Dark Chocolate",
  "Coffee",
  "Wine",
  "Beer"
];

const TRANSLATIONS = {
  en: {
    addTitle: "Add New Product",
    editTitle: "Edit Product",
    nameLabel: "Product Name",
    descLabel: "Description",
    descPlaceholder: "Describe your menu...",
    skuLabel: "SKU / Barcode",
    weightLabel: "Estimated Weight per Product (kg)",
    regPriceLabel: "Regular Price (Rp)",
    surpPriceLabel: "Surplus Price (Rp)",
    imgLabel: "Product Image",
    uploadPlaceholder: "Click to upload",
    catLabel: "Category",
    publishLabel: "Show in Marketplace",
    publishDesc: "Activate for customers to see this product",
    ingredientsTitle: "Main Food Ingredients",
    ingredientsDesc: "Select one or more categories. Total percentage must sum to 100%.",
    addIngredientBtn: "Add Ingredient",
    variantsTitle: "Variants & Extra Options",
    variantsDesc: "Example: Spicy Level, Toppings, Size.",
    addVariantBtn: "Add Variant Group",
    varNameLabel: "Variant Group Name",
    requiredLabel: "Required?",
    requiredYes: "Yes, Required",
    requiredNo: "No, Optional",
    maxSelection: "Max Selections",
    optionsLabel: "Options list:",
    addOptionBtn: "Add Option",
    cancelBtn: "Cancel",
    saveBtn: "Save Product",
    saveChangesBtn: "Save Changes",
    stockNotice: "Note: Stock is managed independently using the 'Stock' button on the product inventory row.",
    validationName: "Product name is required.",
    validationPercentage: "Total composition percentage must sum to 100%. Current total: ",
    estimatedExpiryLabel: "Estimated Shelf Life",
    autoSurplusLabel: "Automatic Surplus Trigger",
    autoSurplusDesc: "Automatically trigger surplus pricing before expiry",
    surplusTriggerLabel: "Surplus Trigger (Batas Mulai)",
    years: "Years",
    months: "Months",
    days: "Days",
    hours: "Hours",
  },
  id: {
    addTitle: "Tambah Produk Baru",
    editTitle: "Edit Produk",
    nameLabel: "Nama Produk",
    descLabel: "Deskripsi Menu",
    descPlaceholder: "Deskripsikan menu...",
    skuLabel: "SKU / Barcode",
    weightLabel: "Estimasi Berat per Produk (kg)",
    regPriceLabel: "Harga Reguler (Rp)",
    surpPriceLabel: "Harga Surplus (Rp)",
    imgLabel: "Gambar Produk",
    uploadPlaceholder: "Klik untuk upload",
    catLabel: "Kategori",
    publishLabel: "Tampil di Marketplace",
    publishDesc: "Aktifkan agar user dapat melihat menu ini",
    ingredientsTitle: "Kandungan Utama Bahan Makanan",
    ingredientsDesc: "Pilih satu atau beberapa kandungan utama. Persentase total harus 100%.",
    addIngredientBtn: "Tambah Kandungan",
    variantsTitle: "Varian & Opsi Tambahan",
    variantsDesc: "Contoh: Level Pedas, Pilihan Topping, Ukuran Gelas.",
    addVariantBtn: "Tambah Grup Varian",
    varNameLabel: "Nama Grup Varian",
    requiredLabel: "Wajib Dipilih?",
    requiredYes: "Ya, Wajib (Required)",
    requiredNo: "Tidak (Optional)",
    maxSelection: "Maksimal Pilihan",
    optionsLabel: "Daftar Pilihan:",
    addOptionBtn: "Tambah Pilihan",
    cancelBtn: "Batal",
    saveBtn: "Simpan Produk",
    saveChangesBtn: "Simpan Perubahan",
    stockNotice: "Catatan: Stok dikelola secara mandiri melalui tombol 'Stok' di baris tabel produk.",
    validationName: "Nama produk wajib diisi.",
    validationPercentage: "Total persentase kandungan harus 100%. Saat ini: ",
    estimatedExpiryLabel: "Estimasi Masa Kedaluwarsa",
    autoSurplusLabel: "Pemicu Surplus Otomatis",
    autoSurplusDesc: "Otomatis ubah harga menjadi surplus sebelum kedaluwarsa",
    surplusTriggerLabel: "Pemicu Surplus (Batas Mulai)",
    years: "Tahun",
    months: "Bulan",
    days: "Hari",
    hours: "Jam",
  }
};

import { useLanguage } from "@/lib/contexts/LanguageContext";

export function AddProductModal({ isOpen, onClose, productToEdit }: AddProductModalProps) {
  const { addProduct, updateProduct, categories, addBatch } = useMerchantContext();
  const { lang } = useLanguage();


  // Form states for initial stock and batch
  const [initialStock, setInitialStock] = useState(0);
  const [initialExpiry, setInitialExpiry] = useState("");
  const [initialSurplusEnabled, setInitialSurplusEnabled] = useState(false);
  const [initialSurplusDate, setInitialSurplusDate] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    description: string;
    sku: string;
    weight: number;
    originalPrice: number;
    surplusPrice: number;
    imageUrl: string;
    isPublished: boolean;
    variantGroups: VariantGroup[];
    ingredients: ProductIngredient[];
    estimatedExpiryHours?: number;
    autoSurplusEnabled?: boolean;
    surplusTriggerHours?: number;
  }>({
    name: "",
    category: categories[0] || "Bakery",
    description: "",
    sku: "",
    weight: 0.1,
    originalPrice: 0,
    surplusPrice: 0,
    imageUrl: "",
    isPublished: false,
    variantGroups: [],
    ingredients: [
      { carbonCategory: CARBON_CATEGORIES[17], percentage: 100 } // Wheat & Rye default
    ],
    estimatedExpiryHours: 0,
    autoSurplusEnabled: false,
    surplusTriggerHours: 0,
  });

  // For estimated expiry input
  const [expiryYears, setExpiryYears] = useState(0);
  const [expiryMonths, setExpiryMonths] = useState(0);
  const [expiryDays, setExpiryDays] = useState(0);
  const [expiryHours, setExpiryHours] = useState(0);

  // For surplus trigger input
  const [triggerYears, setTriggerYears] = useState(0);
  const [triggerMonths, setTriggerMonths] = useState(0);
  const [triggerDays, setTriggerDays] = useState(0);
  const [triggerHours, setTriggerHours] = useState(0);

  const hoursToDuration = (totalHours: number) => {
    let remaining = totalHours || 0;
    const years = Math.floor(remaining / (365 * 24));
    remaining %= (365 * 24);
    const months = Math.floor(remaining / (30 * 24));
    remaining %= (30 * 24);
    const days = Math.floor(remaining / 24);
    const hours = remaining % 24;
    return { years, months, days, hours };
  };



  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (isOpen && productToEdit) {
      const exp = hoursToDuration(productToEdit.estimatedExpiryHours || 0);
      setExpiryYears(exp.years);
      setExpiryMonths(exp.months);
      setExpiryDays(exp.days);
      setExpiryHours(exp.hours);

      const trig = hoursToDuration(productToEdit.surplusTriggerHours || 0);
      setTriggerYears(trig.years);
      setTriggerMonths(trig.months);
      setTriggerDays(trig.days);
      setTriggerHours(trig.hours);

      setFormData({
        name: productToEdit.name || "",
        category: productToEdit.category || categories[0] || "Bakery",
        description: productToEdit.description || "",
        sku: productToEdit.sku || "",
        weight: productToEdit.weight !== undefined ? productToEdit.weight : 0.1,
        originalPrice: productToEdit.originalPrice || 0,
        surplusPrice: productToEdit.surplusPrice || 0,
        imageUrl: productToEdit.imageUrl || "",
        isPublished: productToEdit.isPublished || false,
        variantGroups: productToEdit.variantGroups ? JSON.parse(JSON.stringify(productToEdit.variantGroups)) : [],
        ingredients: productToEdit.ingredients && productToEdit.ingredients.length > 0 
          ? JSON.parse(JSON.stringify(productToEdit.ingredients)) 
          : [{ carbonCategory: CARBON_CATEGORIES[17], percentage: 100 }],
        estimatedExpiryHours: productToEdit.estimatedExpiryHours || 0,
        autoSurplusEnabled: productToEdit.autoSurplusEnabled || false,
        surplusTriggerHours: productToEdit.surplusTriggerHours || 0,
      });
    } else if (isOpen) {
      setExpiryYears(0);
      setExpiryMonths(0);
      setExpiryDays(0);
      setExpiryHours(0);
      setTriggerYears(0);
      setTriggerMonths(0);
      setTriggerDays(0);
      setTriggerHours(0);
      setInitialStock(0);
      setInitialExpiry("");
      setInitialSurplusEnabled(false);
      setInitialSurplusDate("");
      setFormData({
        name: "",
        category: categories[0] || "Bakery",
        description: "",
        sku: "",
        weight: 0.1,
        originalPrice: 0,
        surplusPrice: 0,
        imageUrl: "",
        isPublished: false,
        variantGroups: [],
        ingredients: [
          { carbonCategory: CARBON_CATEGORIES[17], percentage: 100 }
        ],
        estimatedExpiryHours: 0,
        autoSurplusEnabled: false,
        surplusTriggerHours: 0,
      });
    }
  }, [isOpen, productToEdit, categories]);

  // Auto-calculate initial expiry when stock is set and shelf life is filled
  useEffect(() => {
    if (initialStock > 0 && !initialExpiry) {
      const totalExpHours = (expiryYears * 365 * 24) + (expiryMonths * 30 * 24) + (expiryDays * 24) + expiryHours;
      if (totalExpHours > 0) {
        const defaultExpiry = new Date(Date.now() + totalExpHours * 60 * 60 * 1000);
        const yyyy = defaultExpiry.getFullYear();
        const mm = String(defaultExpiry.getMonth() + 1).padStart(2, "0");
        const dd = String(defaultExpiry.getDate()).padStart(2, "0");
        const hh = String(defaultExpiry.getHours()).padStart(2, "0");
        const min = String(defaultExpiry.getMinutes()).padStart(2, "0");
        setInitialExpiry(`${yyyy}-${mm}-${dd}T${hh}:${min}`);

        // Surplus triggers
        const totalTrigHours = (triggerYears * 365 * 24) + (triggerMonths * 30 * 24) + (triggerDays * 24) + triggerHours;
        if (formData.autoSurplusEnabled && totalTrigHours > 0) {
          setInitialSurplusEnabled(true);
          const surplusTime = new Date(defaultExpiry.getTime() - totalTrigHours * 60 * 60 * 1000);
          const s_yyyy = surplusTime.getFullYear();
          const s_mm = String(surplusTime.getMonth() + 1).padStart(2, "0");
          const s_dd = String(surplusTime.getDate()).padStart(2, "0");
          const s_hh = String(surplusTime.getHours()).padStart(2, "0");
          const s_min = String(surplusTime.getMinutes()).padStart(2, "0");
          setInitialSurplusDate(`${s_yyyy}-${s_mm}-${s_dd}T${s_hh}:${s_min}`);
        }
      }
    }
  }, [initialStock, expiryYears, expiryMonths, expiryDays, expiryHours, triggerYears, triggerMonths, triggerDays, triggerHours, formData.autoSurplusEnabled, initialExpiry]);

  const handleInitialExpiryChange = (val: string) => {
    setInitialExpiry(val);
    const totalTrigHours = (triggerYears * 365 * 24) + (triggerMonths * 30 * 24) + (triggerDays * 24) + triggerHours;
    if (val && formData.autoSurplusEnabled && totalTrigHours > 0) {
      const expiryTime = new Date(val).getTime();
      const surplusTime = new Date(expiryTime - totalTrigHours * 60 * 60 * 1000);
      const s_yyyy = surplusTime.getFullYear();
      const s_mm = String(surplusTime.getMonth() + 1).padStart(2, "0");
      const s_dd = String(surplusTime.getDate()).padStart(2, "0");
      const s_hh = String(surplusTime.getHours()).padStart(2, "0");
      const s_min = String(surplusTime.getMinutes()).padStart(2, "0");
      setInitialSurplusDate(`${s_yyyy}-${s_mm}-${s_dd}T${s_hh}:${s_min}`);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "originalPrice" || name === "surplusPrice" || name === "weight"
          ? Number(value)
          : value,
    }));
  };

  const handleToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPublished: checked }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const res = await apiClient.uploadFile("/products/upload-image", file);
        setFormData((prev) => ({ ...prev, imageUrl: res.access_url }));
      } catch (err) {
        console.error("Image upload failed:", err);
        alert(lang === "en" ? "Image upload failed" : "Upload gambar gagal");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // --- Multi-Ingredient Logic ---
  const addIngredient = () => {
    setFormData(prev => {
      const currentList = [...prev.ingredients];
      const newIng: ProductIngredient = {
        carbonCategory: CARBON_CATEGORIES[0],
        percentage: 0
      };
      const nextList = [...currentList, newIng];
      
      const count = nextList.length;
      const basePercentage = Math.floor(100 / count);
      let remainder = 100 - (basePercentage * count);
      
      const updatedList = nextList.map((ing, i) => {
        const extra = i < remainder ? 1 : 0;
        return {
          ...ing,
          percentage: basePercentage + extra
        };
      });

      return {
        ...prev,
        ingredients: updatedList
      };
    });
  };

  const removeIngredient = (idx: number) => {
    setFormData(prev => {
      const nextList = prev.ingredients.filter((_, i) => i !== idx);
      if (nextList.length === 0) {
        return { ...prev, ingredients: [{ carbonCategory: CARBON_CATEGORIES[17], percentage: 100 }] };
      }
      
      const count = nextList.length;
      const basePercentage = Math.floor(100 / count);
      let remainder = 100 - (basePercentage * count);
      
      const updatedList = nextList.map((ing, i) => {
        const extra = i < remainder ? 1 : 0;
        return {
          ...ing,
          percentage: basePercentage + extra
        };
      });

      return {
        ...prev,
        ingredients: updatedList
      };
    });
  };

  const adjustPercentage = (idx: number, delta: number) => {
    setFormData(prev => {
      const list = prev.ingredients.map((ing, i) => {
        if (i === idx) {
          const newVal = Math.min(100, Math.max(0, ing.percentage + delta));
          return { ...ing, percentage: newVal };
        }
        return ing;
      });
      return { ...prev, ingredients: list };
    });
  };

  const updateIngredientCategory = (idx: number, category: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === idx ? { ...ing, carbonCategory: category } : ing)
    }));
  };

  // --- Variant Logic ---
  const addVariantGroup = () => {
    setFormData(prev => ({
      ...prev,
      variantGroups: [
        ...prev.variantGroups,
        {
          id: `vg-${Date.now()}`,
          name: "",
          isRequired: false,
          maxSelections: 1,
          options: []
        }
      ]
    }));
  };

  const updateVariantGroup = (groupId: string, field: keyof VariantGroup, value: any) => {
    setFormData(prev => ({
      ...prev,
      variantGroups: prev.variantGroups.map(vg => 
        vg.id === groupId ? { ...vg, [field]: value } : vg
      )
    }));
  };

  const removeVariantGroup = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      variantGroups: prev.variantGroups.filter(vg => vg.id !== groupId)
    }));
  };

  const addVariantOption = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      variantGroups: prev.variantGroups.map(vg => 
        vg.id === groupId 
          ? { 
              ...vg, 
              options: [
                ...vg.options, 
                { id: `opt-${Date.now()}`, name: "", additionalPrice: 0 }
              ] 
            } 
          : vg
      )
    }));
  };

  const updateVariantOption = (groupId: string, optionId: string, field: keyof VariantOption, value: any) => {
    setFormData(prev => ({
      ...prev,
      variantGroups: prev.variantGroups.map(vg => 
        vg.id === groupId 
          ? {
              ...vg,
              options: vg.options.map(opt => 
                opt.id === optionId ? { ...opt, [field]: value } : opt
              )
            }
          : vg
      )
    }));
  };

  const removeVariantOption = (groupId: string, optionId: string) => {
    setFormData(prev => ({
      ...prev,
      variantGroups: prev.variantGroups.map(vg => 
        vg.id === groupId 
          ? { ...vg, options: vg.options.filter(opt => opt.id !== optionId) }
          : vg
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert(t.validationName);
      return;
    }

    const totalPct = formData.ingredients.reduce((sum, ing) => sum + ing.percentage, 0);
    if (totalPct !== 100) {
      alert(`${t.validationPercentage}${totalPct}%`);
      return;
    }

    const totalExpHours = (expiryYears * 365 * 24) + (expiryMonths * 30 * 24) + (expiryDays * 24) + expiryHours;
    const totalTrigHours = (triggerYears * 365 * 24) + (triggerMonths * 30 * 24) + (triggerDays * 24) + triggerHours;

    const productData: any = {
      ...formData,
      estimatedExpiryHours: totalExpHours,
      autoSurplusEnabled: formData.autoSurplusEnabled,
      surplusTriggerHours: formData.autoSurplusEnabled ? totalTrigHours : 0,
      imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80"
    };

    if (productToEdit) {
      productData.batches = productToEdit.batches || [];
      productData.quantity = productToEdit.quantity || 0;
      updateProduct(productToEdit.id, productData);
      onClose();
    } else {
      productData.batches = [];
      productData.quantity = 0;
      addProduct(productData).then(async (createdProduct) => {
        if (createdProduct && initialStock > 0 && initialExpiry) {
          const expiryISO = new Date(initialExpiry).toISOString();
          const surplusISO = initialSurplusEnabled && initialSurplusDate
            ? new Date(initialSurplusDate).toISOString()
            : undefined;
          try {
            await addBatch(createdProduct.id, initialStock, initialStock, expiryISO, surplusISO);
          } catch (err) {
            console.error("Failed to create initial stock batch:", err);
          }
        }
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {productToEdit ? t.editTitle : t.addTitle}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="productForm" onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image & Category Selection */}
              <div className="w-full md:w-1/3 space-y-4">
                <Label>{t.imgLabel}</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center h-48 bg-slate-50 relative overflow-hidden">
                  {isUploading ? (
                    <div className="text-center text-xs font-bold text-indigo-600 animate-pulse">
                      Uploading...
                    </div>
                  ) : formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-1 text-xs text-gray-500">{t.uploadPlaceholder}</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">{t.catLabel}</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between border rounded-xl p-4 bg-resurva-green-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">{t.publishLabel}</Label>
                    <p className="text-[10px] text-slate-500">{t.publishDesc}</p>
                  </div>
                  <Switch checked={formData.isPublished} onCheckedChange={handleToggle} />
                </div>
              </div>

              {/* Form Details Column */}
              <div className="w-full md:w-2/3 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">{t.nameLabel}</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">{t.descLabel}</Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder={t.descPlaceholder} rows={2} className="rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">{t.skuLabel}</Label>
                    <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="Contoh: BKR-001" className="rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">{t.weightLabel}</Label>
                    <Input id="weight" name="weight" type="number" step="0.01" min={0.01} value={formData.weight} onChange={handleChange} className="rounded-xl border-slate-200" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">{t.regPriceLabel}</Label>
                    <Input id="originalPrice" name="originalPrice" type="number" min={0} value={formData.originalPrice} onChange={handleChange} required className="rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surplusPrice">{t.surpPriceLabel}</Label>
                    <Input id="surplusPrice" name="surplusPrice" type="number" min={0} value={formData.surplusPrice} onChange={handleChange} required className="rounded-xl border-slate-200" />
                  </div>
                </div>

                {!productToEdit && (
                  <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/10 space-y-4">
                    <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase">
                      {lang === "en" ? "Initial Stock Batch (Optional)" : "Batch Stok Awal (Opsional)"}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="initialStock">{lang === "en" ? "Initial Stock Quantity" : "Jumlah Stok Awal"}</Label>
                        <Input
                          id="initialStock"
                          type="number"
                          min={0}
                          value={initialStock}
                          onChange={(e) => setInitialStock(Math.max(0, Number(e.target.value)))}
                          className="rounded-xl border-slate-200 focus-visible:ring-resurva-dark"
                          placeholder="0"
                        />
                      </div>
                      {initialStock > 0 && (
                        <div className="space-y-2">
                          <Label htmlFor="initialExpiry">{lang === "en" ? "Expiry Date & Time" : "Tanggal & Jam Kedaluwarsa"}</Label>
                          <Input
                            id="initialExpiry"
                            type="datetime-local"
                            value={initialExpiry}
                            onChange={(e) => handleInitialExpiryChange(e.target.value)}
                            className="rounded-xl border-slate-200 focus-visible:ring-resurva-dark"
                            required
                          />
                        </div>
                      )}
                    </div>

                    {initialStock > 0 && (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="initialSurplusEnabled"
                            checked={initialSurplusEnabled}
                            onCheckedChange={(checked) => {
                              setInitialSurplusEnabled(checked);
                              if (checked && initialExpiry && triggerHours) {
                                const expiryTime = new Date(initialExpiry).getTime();
                                const totalTrigHours = (triggerYears * 365 * 24) + (triggerMonths * 30 * 24) + (triggerDays * 24) + triggerHours;
                                const surplusTime = new Date(expiryTime - totalTrigHours * 60 * 60 * 1000);
                                const s_yyyy = surplusTime.getFullYear();
                                const s_mm = String(surplusTime.getMonth() + 1).padStart(2, "0");
                                const s_dd = String(surplusTime.getDate()).padStart(2, "0");
                                const s_hh = String(surplusTime.getHours()).padStart(2, "0");
                                const s_min = String(surplusTime.getMinutes()).padStart(2, "0");
                                setInitialSurplusDate(`${s_yyyy}-${s_mm}-${s_dd}T${s_hh}:${s_min}`);
                              } else {
                                setInitialSurplusDate("");
                              }
                            }}
                          />
                          <Label htmlFor="initialSurplusEnabled" className="text-xs font-semibold text-slate-700 cursor-pointer">
                            {lang === "en" ? "Set custom surplus start date" : "Atur tanggal mulai surplus custom"}
                          </Label>
                        </div>
                        {initialSurplusEnabled && (
                          <div className="space-y-2 pl-3 border-l-2 border-indigo-400">
                            <Label htmlFor="initialSurplusDate" className="flex items-center gap-1 text-xs">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {lang === "en" ? "Surplus Start Date & Time" : "Tanggal & Jam Mulai Surplus"}
                            </Label>
                            <Input
                              id="initialSurplusDate"
                              type="datetime-local"
                              value={initialSurplusDate}
                              onChange={(e) => setInitialSurplusDate(e.target.value)}
                              className="rounded-xl border-slate-200 text-sm focus-visible:ring-resurva-dark"
                              required
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-semibold">{t.estimatedExpiryLabel}</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Input
                        type="number"
                        min={0}
                        value={expiryYears}
                        onChange={(e) => setExpiryYears(Math.max(0, Number(e.target.value)))}
                        className="rounded-xl border-slate-200 h-9 text-xs text-center"
                        placeholder="0"
                      />
                      <span className="text-[10px] text-slate-500 block text-center mt-1">{t.years}</span>
                    </div>
                    <div>
                      <Input
                        type="number"
                        min={0}
                        value={expiryMonths}
                        onChange={(e) => setExpiryMonths(Math.max(0, Number(e.target.value)))}
                        className="rounded-xl border-slate-200 h-9 text-xs text-center"
                        placeholder="0"
                      />
                      <span className="text-[10px] text-slate-500 block text-center mt-1">{t.months}</span>
                    </div>
                    <div>
                      <Input
                        type="number"
                        min={0}
                        value={expiryDays}
                        onChange={(e) => setExpiryDays(Math.max(0, Number(e.target.value)))}
                        className="rounded-xl border-slate-200 h-9 text-xs text-center"
                        placeholder="0"
                      />
                      <span className="text-[10px] text-slate-500 block text-center mt-1">{t.days}</span>
                    </div>
                    <div>
                      <Input
                        type="number"
                        min={0}
                        value={expiryHours}
                        onChange={(e) => setExpiryHours(Math.max(0, Number(e.target.value)))}
                        className="rounded-xl border-slate-200 h-9 text-xs text-center"
                        placeholder="0"
                      />
                      <span className="text-[10px] text-slate-500 block text-center mt-1">{t.hours}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between border rounded-xl p-3 bg-yellow-50/20">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold">{t.autoSurplusLabel}</Label>
                      <p className="text-[10px] text-slate-500">{t.autoSurplusDesc}</p>
                    </div>
                    <Switch
                      checked={formData.autoSurplusEnabled || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoSurplusEnabled: checked }))}
                    />
                  </div>

                  {formData.autoSurplusEnabled && (
                    <div className="space-y-2 pl-3 border-l-2 border-yellow-300 transition-all">
                      <Label className="text-xs text-slate-600 font-medium">{t.surplusTriggerLabel}</Label>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <Input
                            type="number"
                            min={0}
                            value={triggerYears}
                            onChange={(e) => setTriggerYears(Math.max(0, Number(e.target.value)))}
                            className="rounded-xl border-slate-200 h-9 text-xs text-center"
                            placeholder="0"
                          />
                          <span className="text-[10px] text-slate-500 block text-center mt-1">{t.years}</span>
                        </div>
                        <div>
                          <Input
                            type="number"
                            min={0}
                            value={triggerMonths}
                            onChange={(e) => setTriggerMonths(Math.max(0, Number(e.target.value)))}
                            className="rounded-xl border-slate-200 h-9 text-xs text-center"
                            placeholder="0"
                          />
                          <span className="text-[10px] text-slate-500 block text-center mt-1">{t.months}</span>
                        </div>
                        <div>
                          <Input
                            type="number"
                            min={0}
                            value={triggerDays}
                            onChange={(e) => setTriggerDays(Math.max(0, Number(e.target.value)))}
                            className="rounded-xl border-slate-200 h-9 text-xs text-center"
                            placeholder="0"
                          />
                          <span className="text-[10px] text-slate-500 block text-center mt-1">{t.days}</span>
                        </div>
                        <div>
                          <Input
                            type="number"
                            min={0}
                            value={triggerHours}
                            onChange={(e) => setTriggerHours(Math.max(0, Number(e.target.value)))}
                            className="rounded-xl border-slate-200 h-9 text-xs text-center"
                            placeholder="0"
                          />
                          <span className="text-[10px] text-slate-500 block text-center mt-1">{t.hours}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Carbon Ingredients Composition */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{t.ingredientsTitle}</h4>
                      <p className="text-[10px] text-slate-500">{t.ingredientsDesc}</p>
                    </div>
                    <Button type="button" onClick={addIngredient} variant="outline" size="sm" className="text-resurva-dark border-resurva-dark rounded-xl">
                      <Plus className="w-3.5 h-3.5 mr-1" /> {t.addIngredientBtn}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {formData.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-slate-50 p-3 border rounded-xl">
                        <select
                          value={ing.carbonCategory}
                          onChange={(e) => updateIngredientCategory(idx, e.target.value)}
                          className="flex-1 h-9 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                        >
                          {CARBON_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => adjustPercentage(idx, -10)}
                            className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-slate-700 w-12 text-center">
                            {ing.percentage}%
                          </span>
                          <button
                            type="button"
                            onClick={() => adjustPercentage(idx, 10)}
                            className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeIngredient(idx)}
                          className="text-slate-400 hover:text-red-500 px-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Variant Builder Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">{t.variantsTitle}</h3>
                  <p className="text-xs text-slate-500">{t.variantsDesc}</p>
                </div>
                <Button type="button" onClick={addVariantGroup} variant="outline" className="text-resurva-dark border-resurva-dark rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.addVariantBtn}
                </Button>
              </div>

              <div className="space-y-4">
                {formData.variantGroups.map((vg) => (
                  <div key={vg.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label>{t.varNameLabel}</Label>
                          <Input 
                            value={vg.name} 
                            onChange={(e) => updateVariantGroup(vg.id, "name", e.target.value)} 
                            placeholder="Contoh: Level Pedas" 
                            required
                            className="rounded-lg h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>{t.requiredLabel}</Label>
                          <select 
                            value={vg.isRequired ? "true" : "false"} 
                            onChange={(e) => updateVariantGroup(vg.id, "isRequired", e.target.value === "true")}
                            className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                          >
                            <option value="true">{t.requiredYes}</option>
                            <option value="false">{t.requiredNo}</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label>{t.maxSelection}</Label>
                          <Input 
                            type="number" 
                            min={1} 
                            value={vg.maxSelections} 
                            onChange={(e) => updateVariantGroup(vg.id, "maxSelections", Number(e.target.value))} 
                            className="rounded-lg h-9"
                          />
                        </div>
                      </div>
                      <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto" onClick={() => removeVariantGroup(vg.id)}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    <div className="pl-4 border-l-2 border-slate-200 space-y-3">
                      <Label className="text-slate-500 text-xs">{t.optionsLabel}</Label>
                      {vg.options.map((opt) => (
                        <div key={opt.id} className="flex gap-3 items-center">
                          <Input 
                            className="flex-1 rounded-lg h-8"
                            value={opt.name} 
                            onChange={(e) => updateVariantOption(vg.id, opt.id, "name", e.target.value)} 
                            placeholder="Nama Pilihan (contoh: Ekstra Keju)" 
                            required
                          />
                          <div className="relative w-32">
                            <span className="absolute left-3 top-2 text-slate-500 text-xs">Rp</span>
                            <Input 
                              type="number" 
                              className="pl-8 rounded-lg h-8"
                              value={opt.additionalPrice} 
                              onChange={(e) => updateVariantOption(vg.id, opt.id, "additionalPrice", Number(e.target.value))} 
                            />
                          </div>
                          <button type="button" onClick={() => removeVariantOption(vg.id, opt.id)} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <Button type="button" variant="ghost" size="sm" onClick={() => addVariantOption(vg.id)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2">
                        <Plus className="w-4 h-4 mr-1" /> {t.addOptionBtn}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Notice Box about Stock Batch Management */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed font-semibold">
                {t.stockNotice}
              </p>
            </div>

          </form>
        </div>

        <div className="p-6 border-t flex justify-end gap-3 shrink-0 bg-slate-50 rounded-b-2xl">
          <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
            {t.cancelBtn}
          </Button>
          <Button type="submit" form="productForm" className="bg-resurva-dark hover:bg-resurva-dark-light text-white rounded-xl">
            {productToEdit ? t.saveChangesBtn : t.saveBtn}
          </Button>
        </div>
      </div>
    </div>
  );
}
