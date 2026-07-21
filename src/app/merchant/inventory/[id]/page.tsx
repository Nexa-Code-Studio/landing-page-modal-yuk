"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMerchantContext, Product, ProductBatch, VariantGroup, VariantOption, ProductIngredient } from "@/lib/contexts/MerchantContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Plus, Edit, Trash2, Calendar, Clock, Save, Info, AlertTriangle, Layers, Settings, MoreVertical } from "lucide-react";

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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const nowTime = Date.now();

  const {
    products, updateProduct, categories,
    batches, addBatch, updateBatch, deleteBatch
  } = useMerchantContext();

  const product = products.find(p => p.id === id);
  const productBatches = batches.filter(b => b.productId === id);

  // Language settings
  const { lang } = useLanguage();



  // Form states for Product Info (Left Column)
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [surplusPrice, setSurplusPrice] = useState(0);
  const [weight, setWeight] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const [description, setDescription] = useState("");
  const [autoSurplusEnabled, setAutoSurplusEnabled] = useState(false);

  // Expiry Duration splits
  const [expiryYears, setExpiryYears] = useState(0);
  const [expiryMonths, setExpiryMonths] = useState(0);
  const [expiryDays, setExpiryDays] = useState(0);
  const [expiryHours, setExpiryHours] = useState(0);

  // Trigger Duration splits
  const [triggerYears, setTriggerYears] = useState(0);
  const [triggerMonths, setTriggerMonths] = useState(0);
  const [triggerDays, setTriggerDays] = useState(0);
  const [triggerHours, setTriggerHours] = useState(0);

  // Composition and Variants
  const [ingredients, setIngredients] = useState<ProductIngredient[]>([]);
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);

  // States to detect modifications
  const [isModified, setIsModified] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal States for Add & Edit Batch
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [batchQty, setBatchQty] = useState(10);
  const [batchExpiry, setBatchExpiry] = useState("");
  const [customSurplusDateEnabled, setCustomSurplusDateEnabled] = useState(false);
  const [batchSurplusDate, setBatchSurplusDate] = useState("");

  const [editingBatch, setEditingBatch] = useState<ProductBatch | null>(null);
  const [editingBatchQty, setEditingBatchQty] = useState(10);
  const [editingBatchExpiry, setEditingBatchExpiry] = useState("");
  const [editingBatchSurplusDateEnabled, setEditingBatchSurplusDateEnabled] = useState(false);
  const [editingBatchSurplusDate, setEditingBatchSurplusDate] = useState("");

  // Dropdown states for batch actions
  const [activeBatchMenuId, setActiveBatchMenuId] = useState<string | null>(null);

  // Convert hours to splits helper
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

  // Sync state when product loads/updates from Context
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setSku(product.sku || "");
      setCategory(product.category || "");
      setOriginalPrice(product.originalPrice || 0);
      setSurplusPrice(product.surplusPrice || 0);
      setWeight(product.weight || 0);
      setMinStock(product.minStock || 0);
      setDescription(product.description || "");
      setAutoSurplusEnabled(product.autoSurplusEnabled || false);

      const exp = hoursToDuration(product.estimatedExpiryHours || 0);
      setExpiryYears(exp.years);
      setExpiryMonths(exp.months);
      setExpiryDays(exp.days);
      setExpiryHours(exp.hours);

      const trig = hoursToDuration(product.surplusTriggerHours || 0);
      setTriggerYears(trig.years);
      setTriggerMonths(trig.months);
      setTriggerDays(trig.days);
      setTriggerHours(trig.hours);

      setIngredients(product.ingredients ? JSON.parse(JSON.stringify(product.ingredients)) : []);
      setVariantGroups(product.variantGroups ? JSON.parse(JSON.stringify(product.variantGroups)) : []);
    }
  }, [product]);

  // Dirty checking
  useEffect(() => {
    if (!product) return;
    const currentExpiryHours = (expiryYears * 365 * 24) + (expiryMonths * 30 * 24) + (expiryDays * 24) + expiryHours;
    const currentTriggerHours = (triggerYears * 365 * 24) + (triggerMonths * 30 * 24) + (triggerDays * 24) + triggerHours;

    const ingredientsChanged = JSON.stringify(ingredients) !== JSON.stringify(product.ingredients || []);
    const variantGroupsChanged = JSON.stringify(variantGroups) !== JSON.stringify(product.variantGroups || []);

    const hasChanged =
      name !== (product.name || "") ||
      sku !== (product.sku || "") ||
      category !== (product.category || "") ||
      originalPrice !== (product.originalPrice || 0) ||
      surplusPrice !== (product.surplusPrice || 0) ||
      weight !== (product.weight || 0) ||
      minStock !== (product.minStock || 0) ||
      description !== (product.description || "") ||
      autoSurplusEnabled !== (product.autoSurplusEnabled || false) ||
      currentExpiryHours !== (product.estimatedExpiryHours || 0) ||
      currentTriggerHours !== (product.surplusTriggerHours || 0) ||
      ingredientsChanged ||
      variantGroupsChanged;
    
    setIsModified(hasChanged);
  }, [name, sku, category, originalPrice, surplusPrice, weight, minStock, description, autoSurplusEnabled, expiryYears, expiryMonths, expiryDays, expiryHours, triggerYears, triggerMonths, triggerDays, triggerHours, ingredients, variantGroups, product]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveBatchMenuId(null);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Produk Tidak Ditemukan</h2>
        <p className="text-slate-500 text-sm">Produk dengan ID "{id}" tidak dapat ditemukan di inventaris Anda.</p>
        <Button onClick={() => router.push("/merchant/inventory")} className="bg-resurva-dark hover:bg-resurva-dark-light text-white rounded-xl">
          Kembali ke Inventaris
        </Button>
      </div>
    );
  }

  // Handle product save
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const totalExpHours = (expiryYears * 365 * 24) + (expiryMonths * 30 * 24) + (expiryDays * 24) + expiryHours;
    const totalTrigHours = (triggerYears * 365 * 24) + (triggerMonths * 30 * 24) + (triggerDays * 24) + triggerHours;

    // Ingredients percentage verification
    if (ingredients.length > 0) {
      const totalPct = ingredients.reduce((sum, ing) => sum + ing.percentage, 0);
      if (totalPct !== 100) {
        alert(lang === "en" ? `Total ingredient percentage must sum to 100%. Current total: ${totalPct}%` : `Total persentase kandungan harus 100%. Saat ini: ${totalPct}%`);
        return;
      }
    }

    updateProduct(product.id, {
      name,
      sku,
      category,
      originalPrice,
      surplusPrice,
      weight,
      minStock,
      description,
      estimatedExpiryHours: totalExpHours,
      autoSurplusEnabled,
      surplusTriggerHours: autoSurplusEnabled ? totalTrigHours : 0,
      ingredients,
      variantGroups
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Helper to generate dynamic batch tag format: {sku}-{DDMMYYYY}-{A/B/C...}
  function getBatchTag(batch: ProductBatch) {
    if (!product || !batch.expiryDate) return "-";
    const productSku = sku || "PROD";
    const expiryDate = new Date(batch.expiryDate);
    
    const day = String(expiryDate.getDate()).padStart(2, '0');
    const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
    const year = expiryDate.getFullYear();
    const dateStr = `${day}${month}${year}`;
    const dateKey = `${year}-${month}-${day}`;
    
    const sameDayBatches = productBatches
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
    
    return `${productSku}-${dateStr}-${letter}`;
  }

  // Helper function to check if batch is in surplus state
  function isBatchSurplus(batch: ProductBatch) {
    if (!batch.expiryDate) return false;
    const expiryTime = new Date(batch.expiryDate).getTime();
    if (expiryTime <= nowTime) return false;
    
    if (autoSurplusEnabled) {
      const remainingHours = (expiryTime - nowTime) / (1000 * 60 * 60);
      const totalTrigHours = (triggerYears * 365 * 24) + (triggerMonths * 30 * 24) + (triggerDays * 24) + triggerHours;
      return remainingHours <= totalTrigHours;
    }
    
    return batch.menuType === "Surplus";
  }

  // Helper function to get surplus start date of batch
  function getBatchSurplusDate(batch: ProductBatch) {
    if (batch.surplusStartDate) return batch.surplusStartDate;
    const totalTrigHours = (triggerYears * 365 * 24) + (triggerMonths * 30 * 24) + (triggerDays * 24) + triggerHours;
    if (autoSurplusEnabled && totalTrigHours && batch.expiryDate) {
      const expiryTime = new Date(batch.expiryDate).getTime();
      const surplusTime = expiryTime - (totalTrigHours * 60 * 60 * 1000);
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

  // Auto-populate batchExpiry in Add Batch Modal when opened
  const handleOpenAddBatch = () => {
    setIsAddBatchOpen(true);
    setBatchQty(10);
    const totalExpHours = (expiryYears * 365 * 24) + (expiryMonths * 30 * 24) + (expiryDays * 24) + expiryHours;
    const totalTrigHours = (triggerYears * 365 * 24) + (triggerMonths * 30 * 24) + (triggerDays * 24) + triggerHours;

    if (totalExpHours && totalExpHours > 0) {
      const defaultExpiry = new Date(Date.now() + totalExpHours * 60 * 60 * 1000);
      const yyyy = defaultExpiry.getFullYear();
      const mm = String(defaultExpiry.getMonth() + 1).padStart(2, "0");
      const dd = String(defaultExpiry.getDate()).padStart(2, "0");
      const hh = String(defaultExpiry.getHours()).padStart(2, "0");
      const min = String(defaultExpiry.getMinutes()).padStart(2, "0");
      setBatchExpiry(`${yyyy}-${mm}-${dd}T${hh}:${min}`);

      // Check if auto surplus trigger is set
      if (autoSurplusEnabled && totalTrigHours && totalTrigHours > 0) {
        setCustomSurplusDateEnabled(true);
        const surplusTime = new Date(defaultExpiry.getTime() - totalTrigHours * 60 * 60 * 1000);
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
      setBatchExpiry("");
      setCustomSurplusDateEnabled(false);
      setBatchSurplusDate("");
    }
  };

  // Update surplus date when expiry changes (Add Modal)
  const handleAddExpiryChange = (val: string) => {
    setBatchExpiry(val);
    const totalTrigHours = (triggerYears * 365 * 24) + (triggerMonths * 30 * 24) + (triggerDays * 24) + triggerHours;
    if (val && autoSurplusEnabled && totalTrigHours) {
      const expiryTime = new Date(val).getTime();
      const surplusTime = new Date(expiryTime - totalTrigHours * 60 * 60 * 1000);
      const s_yyyy = surplusTime.getFullYear();
      const s_mm = String(surplusTime.getMonth() + 1).padStart(2, "0");
      const s_dd = String(surplusTime.getDate()).padStart(2, "0");
      const s_hh = String(surplusTime.getHours()).padStart(2, "0");
      const s_min = String(surplusTime.getMinutes()).padStart(2, "0");
      setBatchSurplusDate(`${s_yyyy}-${s_mm}-${s_dd}T${s_hh}:${s_min}`);
    }
  };

  // Submit Add Batch
  const handleAddBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const expiryISO = batchExpiry ? new Date(batchExpiry).toISOString() : new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const surplusISO = customSurplusDateEnabled && batchSurplusDate ? new Date(batchSurplusDate).toISOString() : undefined;

    try {
      await addBatch(product.id, batchQty, batchQty, expiryISO, surplusISO);
    } catch (err) {
      console.error("Add batch failed:", err);
    }

    setIsAddBatchOpen(false);
  };

  // Delete Batch
  const handleDeleteBatch = async (batchId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus batch ini?")) {
      try {
        await deleteBatch(batchId);
      } catch (err) {
        console.error("Delete batch failed:", err);
      }
    }
  };

  // Open Edit Batch Modal
  const handleOpenEditBatch = (batch: ProductBatch) => {
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

    const surplusDate = getBatchSurplusDate(batch);
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

  // Update surplus date when expiry changes (Edit Modal)
  const handleEditExpiryChange = (val: string) => {
    setEditingBatchExpiry(val);
    const totalTrigHours = (triggerYears * 365 * 24) + (triggerMonths * 30 * 24) + (triggerDays * 24) + triggerHours;
    if (val && autoSurplusEnabled && totalTrigHours) {
      const expiryTime = new Date(val).getTime();
      const surplusTime = new Date(expiryTime - totalTrigHours * 60 * 60 * 1000);
      const s_yyyy = surplusTime.getFullYear();
      const s_mm = String(surplusTime.getMonth() + 1).padStart(2, "0");
      const s_dd = String(surplusTime.getDate()).padStart(2, "0");
      const s_hh = String(surplusTime.getHours()).padStart(2, "0");
      const s_min = String(surplusTime.getMinutes()).padStart(2, "0");
      setEditingBatchSurplusDate(`${s_yyyy}-${s_mm}-${s_dd}T${s_hh}:${s_min}`);
    }
  };

  // Submit Edit Batch
  const handleEditBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

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
  };

  // --- Multi-Ingredient Logic ---
  const addIngredient = () => {
    const nextList = [...ingredients, { carbonCategory: CARBON_CATEGORIES[0], percentage: 0 }];
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
    setIngredients(updatedList);
  };

  const removeIngredient = (idx: number) => {
    const nextList = ingredients.filter((_, i) => i !== idx);
    if (nextList.length === 0) {
      setIngredients([]);
      return;
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
    setIngredients(updatedList);
  };

  const adjustPercentage = (idx: number, delta: number) => {
    const list = ingredients.map((ing, i) => {
      if (i === idx) {
        const newVal = Math.min(100, Math.max(0, ing.percentage + delta));
        return { ...ing, percentage: newVal };
      }
      return ing;
    });
    setIngredients(list);
  };

  const updateIngredientCategory = (idx: number, categoryVal: string) => {
    setIngredients(prev => prev.map((ing, i) => i === idx ? { ...ing, carbonCategory: categoryVal } : ing));
  };

  // --- Variant Logic ---
  const addVariantGroup = () => {
    setVariantGroups([
      ...variantGroups,
      {
        id: `vg-${Date.now()}`,
        name: "",
        isRequired: false,
        maxSelections: 1,
        options: []
      }
    ]);
  };

  const updateVariantGroup = (groupId: string, field: keyof VariantGroup, value: any) => {
    setVariantGroups(prev => prev.map(vg => 
      vg.id === groupId ? { ...vg, [field]: value } : vg
    ));
  };

  const removeVariantGroup = (groupId: string) => {
    setVariantGroups(prev => prev.filter(vg => vg.id !== groupId));
  };

  const addVariantOption = (groupId: string) => {
    setVariantGroups(prev => prev.map(vg => 
      vg.id === groupId 
        ? { 
            ...vg, 
            options: [
              ...vg.options, 
              { id: `opt-${Date.now()}`, name: "", additionalPrice: 0 }
            ] 
          } 
        : vg
    ));
  };

  const updateVariantOption = (groupId: string, optionId: string, field: keyof VariantOption, value: any) => {
    setVariantGroups(prev => prev.map(vg => 
      vg.id === groupId 
        ? {
            ...vg,
            options: vg.options.map(opt => 
              opt.id === optionId ? { ...opt, [field]: value } : opt
            )
          }
        : vg
    ));
  };

  const removeVariantOption = (groupId: string, optionId: string) => {
    setVariantGroups(prev => prev.map(vg => 
      vg.id === groupId 
        ? { ...vg, options: vg.options.filter(opt => opt.id !== optionId) }
        : vg
    ));
  };

  // Separate active and expired batches
  const allBatches = productBatches;
  const activeBatches = allBatches.filter(b => !b.expiryDate || new Date(b.expiryDate).getTime() > nowTime);
  const expiredBatches = allBatches.filter(b => b.expiryDate && new Date(b.expiryDate).getTime() <= nowTime);

  // Translations helper
  const t_pcs = lang === "en" ? "pcs" : "pcs";
  const t_cancelBtn = lang === "en" ? "Cancel" : "Batal";
  const t_saveBtn = lang === "en" ? "Save" : "Simpan";

  return (
    <div className="space-y-6 p-4 md:p-8 w-full font-sans">
      {/* Header / Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => router.push("/merchant/inventory")} 
            variant="outline" 
            className="h-9 w-9 p-0 rounded-xl hover:bg-slate-50 border-slate-200 text-slate-650 shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
              Detail Katalog
              <span className="text-slate-400 font-mono text-sm">/{sku || "PROD"}</span>
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">Kelola data dasar produk, varian menu, bahan makanan, dan kustomisasi stok batch terperinci.</p>
          </div>
        </div>
      </div>

      {/* Main Split Screen Grid - Balanced 5/7 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Comprehensive Product Info Form (spans 5 columns) */}
        <form onSubmit={handleSaveProduct} className="lg:col-span-5 bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-resurva-dark" />
            Informasi Dasar Produk
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="prodName" className="text-xs font-bold text-slate-600">Nama Produk</Label>
                <Input
                  id="prodName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-slate-200 text-sm focus-visible:ring-resurva-dark"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prodSku" className="text-xs font-bold text-slate-600">SKU</Label>
                <Input
                  id="prodSku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="rounded-xl border-slate-200 text-sm focus-visible:ring-resurva-dark"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="prodCategory" className="text-xs font-bold text-slate-600">Kategori</Label>
                <select
                  id="prodCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-resurva-dark"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prodWeight" className="text-xs font-bold text-slate-600">Estimasi Berat (kg)</Label>
                <Input
                  id="prodWeight"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="rounded-xl border-slate-200 text-sm focus-visible:ring-resurva-dark"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="priceReg" className="text-xs font-bold text-slate-600">Harga Reguler (Rp)</Label>
                <Input
                  id="priceReg"
                  type="number"
                  min="0"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="rounded-xl border-slate-200 text-sm focus-visible:ring-resurva-dark"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priceSurplus" className="text-xs font-bold text-slate-600">Harga Surplus (Rp)</Label>
                <Input
                  id="priceSurplus"
                  type="number"
                  min="0"
                  value={surplusPrice}
                  onChange={(e) => setSurplusPrice(Number(e.target.value))}
                  className="rounded-xl border-slate-200 text-sm focus-visible:ring-resurva-dark"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="minStockInput" className="text-xs font-bold text-slate-600">Stok Minimum</Label>
                <Input
                  id="minStockInput"
                  type="number"
                  min="0"
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="rounded-xl border-slate-200 text-sm focus-visible:ring-resurva-dark"
                />
              </div>
            </div>

            {/* Estimated Expiry Duration picker */}
            <div className="space-y-2 pt-1.5">
              <Label className="text-xs font-bold text-slate-600">Estimasi Masa Kedaluwarsa</Label>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Input
                    type="number"
                    min={0}
                    value={expiryYears}
                    onChange={(e) => setExpiryYears(Math.max(0, Number(e.target.value)))}
                    className="rounded-xl border-slate-200 h-9 text-xs text-center focus-visible:ring-resurva-dark"
                    placeholder="0"
                  />
                  <span className="text-[10px] text-slate-500 block text-center mt-1">Tahun</span>
                </div>
                <div>
                  <Input
                    type="number"
                    min={0}
                    value={expiryMonths}
                    onChange={(e) => setExpiryMonths(Math.max(0, Number(e.target.value)))}
                    className="rounded-xl border-slate-200 h-9 text-xs text-center focus-visible:ring-resurva-dark"
                    placeholder="0"
                  />
                  <span className="text-[10px] text-slate-500 block text-center mt-1">Bulan</span>
                </div>
                <div>
                  <Input
                    type="number"
                    min={0}
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Math.max(0, Number(e.target.value)))}
                    className="rounded-xl border-slate-200 h-9 text-xs text-center focus-visible:ring-resurva-dark"
                    placeholder="0"
                  />
                  <span className="text-[10px] text-slate-500 block text-center mt-1">Hari</span>
                </div>
                <div>
                  <Input
                    type="number"
                    min={0}
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(Math.max(0, Number(e.target.value)))}
                    className="rounded-xl border-slate-200 h-9 text-xs text-center focus-visible:ring-resurva-dark"
                    placeholder="0"
                  />
                  <span className="text-[10px] text-slate-500 block text-center mt-1">Jam</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="space-y-0.5">
                <Label htmlFor="detailAutoSurplus" className="text-xs font-bold text-slate-700 cursor-pointer">Pemicu Surplus Otomatis</Label>
                <p className="text-[10px] text-slate-400">Aktifkan diskon otomatis menjelang kedaluwarsa</p>
              </div>
              <Switch
                id="detailAutoSurplus"
                checked={autoSurplusEnabled}
                onCheckedChange={setAutoSurplusEnabled}
              />
            </div>

            {autoSurplusEnabled && (
              <div className="space-y-2 pl-2 border-l-2 border-resurva-dark transition-all">
                <Label className="text-xs font-bold text-slate-600">Pemicu Surplus (Batas Mulai)</Label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Input
                      type="number"
                      min={0}
                      value={triggerYears}
                      onChange={(e) => setTriggerYears(Math.max(0, Number(e.target.value)))}
                      className="rounded-xl border-slate-200 h-9 text-xs text-center focus-visible:ring-resurva-dark"
                      placeholder="0"
                    />
                    <span className="text-[10px] text-slate-500 block text-center mt-1">Tahun</span>
                  </div>
                  <div>
                    <Input
                      type="number"
                      min={0}
                      value={triggerMonths}
                      onChange={(e) => setTriggerMonths(Math.max(0, Number(e.target.value)))}
                      className="rounded-xl border-slate-200 h-9 text-xs text-center focus-visible:ring-resurva-dark"
                      placeholder="0"
                    />
                    <span className="text-[10px] text-slate-500 block text-center mt-1">Bulan</span>
                  </div>
                  <div>
                    <Input
                      type="number"
                      min={0}
                      value={triggerDays}
                      onChange={(e) => setTriggerDays(Math.max(0, Number(e.target.value)))}
                      className="rounded-xl border-slate-200 h-9 text-xs text-center focus-visible:ring-resurva-dark"
                      placeholder="0"
                    />
                    <span className="text-[10px] text-slate-500 block text-center mt-1">Hari</span>
                  </div>
                  <div>
                    <Input
                      type="number"
                      min={0}
                      value={triggerHours}
                      onChange={(e) => setTriggerHours(Math.max(0, Number(e.target.value)))}
                      className="rounded-xl border-slate-200 h-9 text-xs text-center focus-visible:ring-resurva-dark"
                      placeholder="0"
                    />
                    <span className="text-[10px] text-slate-500 block text-center mt-1">Jam</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="prodDesc" className="text-xs font-bold text-slate-600">Deskripsi Produk</Label>
              <textarea
                id="prodDesc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-350"
              />
            </div>

            {/* Combined Panel 1: Kandungan Bahan Makanan */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-resurva-dark" />
                    Bahan Makanan (Ingredients)
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Persentase total harus genap 100%.</p>
                </div>
                <Button 
                  type="button" 
                  onClick={addIngredient} 
                  variant="outline" 
                  size="sm" 
                  className="text-resurva-dark border-resurva-dark hover:bg-resurva-green-muted/30 rounded-lg text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" /> Tambah
                </Button>
              </div>

              {ingredients.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-3 text-center border border-dashed rounded-xl">Belum ada bahan dasar.</p>
              ) : (
                <div className="space-y-2">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2.5 border border-slate-100 rounded-xl">
                      <select
                        value={ing.carbonCategory}
                        onChange={(e) => updateIngredientCategory(idx, e.target.value)}
                        className="flex-1 h-8 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none"
                      >
                        {CARBON_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => adjustPercentage(idx, -10)}
                          className="w-7 h-7 rounded-lg bg-slate-250 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-700 w-10 text-center">
                          {ing.percentage}%
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustPercentage(idx, 10)}
                          className="w-7 h-7 rounded-lg bg-slate-250 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeIngredient(idx)}
                        className="text-slate-400 hover:text-red-500 px-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <div className="flex justify-between items-center p-2.5 bg-slate-100 rounded-xl text-xs">
                    <span className="font-bold text-slate-650">Total Persentase:</span>
                    <span className={`font-bold ${ingredients.reduce((sum, ing) => sum + ing.percentage, 0) === 100 ? "text-green-650" : "text-orange-600"}`}>
                      {ingredients.reduce((sum, ing) => sum + ing.percentage, 0)}% / 100%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Combined Panel 2: Varian & Opsi Tambahan */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-resurva-dark" />
                    Varian & Opsi Tambahan
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Contoh: Level Pedas, Pilihan Topping, dll.</p>
                </div>
                <Button 
                  type="button" 
                  onClick={addVariantGroup} 
                  variant="outline" 
                  size="sm" 
                  className="text-resurva-dark border-resurva-dark hover:bg-resurva-green-muted/30 rounded-lg text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" /> Tambah Grup
                </Button>
              </div>

              {variantGroups.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-3 text-center border border-dashed rounded-xl">Belum ada grup varian.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {variantGroups.map((vg) => (
                    <div key={vg.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50 relative space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <Label className="text-[10px] font-bold text-slate-500">Nama Grup</Label>
                            <Input 
                              value={vg.name} 
                              onChange={(e) => updateVariantGroup(vg.id, "name", e.target.value)} 
                              placeholder="Level Pedas" 
                              required
                              className="rounded-lg h-8 bg-white text-xs focus-visible:ring-resurva-dark"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] font-bold text-slate-500">Wajib?</Label>
                            <select 
                              value={vg.isRequired ? "true" : "false"} 
                              onChange={(e) => updateVariantGroup(vg.id, "isRequired", e.target.value === "true")}
                              className="flex h-8 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none focus:border-resurva-dark"
                            >
                              <option value="true">Wajib</option>
                              <option value="false">Opsional</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-[10px] font-bold text-slate-500">Maks Pilihan</Label>
                            <Input 
                              type="number" 
                              min={1} 
                              value={vg.maxSelections} 
                              onChange={(e) => updateVariantGroup(vg.id, "maxSelections", Number(e.target.value))} 
                              className="rounded-lg h-8 bg-white text-xs focus-visible:ring-resurva-dark"
                            />
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 h-auto cursor-pointer shrink-0 mt-4" 
                          onClick={() => removeVariantGroup(vg.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="pl-3 border-l border-slate-200 space-y-2">
                        <Label className="text-slate-500 text-[10px] font-bold">Opsi Pilihan:</Label>
                        {vg.options.map((opt) => (
                          <div key={opt.id} className="flex gap-2 items-center">
                            <Input 
                              className="flex-1 rounded-lg h-7 bg-white text-xs focus-visible:ring-resurva-dark"
                              value={opt.name} 
                              onChange={(e) => updateVariantOption(vg.id, opt.id, "name", e.target.value)} 
                              placeholder="Ekstra Keju" 
                              required
                            />
                            <div className="relative w-24 shrink-0">
                              <span className="absolute left-2 top-1.5 text-slate-400 text-[10px] font-semibold">Rp</span>
                              <Input 
                                type="number" 
                                className="pl-6 rounded-lg h-7 bg-white text-xs focus-visible:ring-resurva-dark"
                                value={opt.additionalPrice} 
                                onChange={(e) => updateVariantOption(vg.id, opt.id, "additionalPrice", Number(e.target.value))} 
                              />
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeVariantOption(vg.id, opt.id)} 
                              className="text-slate-400 hover:text-red-500 cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => addVariantOption(vg.id)} 
                          className="text-resurva-dark hover:text-resurva-dark-light hover:bg-resurva-green-muted/30 rounded-lg text-[10px] font-bold py-1 h-7"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Tambah Pilihan
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="pt-2 flex flex-col gap-2 border-t pt-4">
            <Button
              type="submit"
              disabled={!isModified}
              className={`w-full py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                isModified 
                  ? "bg-resurva-dark hover:bg-resurva-dark-light text-white cursor-pointer" 
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </Button>
            {saveSuccess && (
              <p className="text-xs font-bold text-emerald-600 text-center animate-bounce mt-1">✓ Perubahan produk berhasil disimpan!</p>
            )}
          </div>
        </form>

        {/* Right Column: Batch List & History (spans 7 columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-resurva-dark" />
                Manajemen & Riwayat Batch
              </h3>
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
                    {product.id === "prod-1" && <li><strong className="text-slate-400">Tanggal Dibuat</strong>: Kapan batch ditambahkan</li>}
                    <li><strong className="text-emerald-450 font-bold">Mulai Surplus</strong>: Tanggal diskon surplus aktif (hijau)</li>
                    <li><strong className="text-rose-450 font-bold">Kedaluwarsa</strong>: Tanggal kedaluwarsa produk (merah)</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleOpenAddBatch}
              className="bg-resurva-dark hover:bg-resurva-dark-light text-white text-xs font-bold rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Stok
            </Button>
          </div>

          {/* Active Batches Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-resurva-dark-light" />
              Batch Aktif ({activeBatches.length})
            </h4>

            {activeBatches.length === 0 ? (
              <p className="text-xs text-slate-500 italic pl-4 py-2">Tidak ada batch aktif saat ini.</p>
            ) : (
              <div className="relative pl-4 space-y-1">
                <div className="absolute left-[9px] top-2 bottom-[24px] w-[2px] bg-slate-200"></div>
                {activeBatches.map((batch) => {
                  const batchTag = getBatchTag(batch);
                  const isSurplus = isBatchSurplus(batch);
                  const price = isSurplus ? surplusPrice : originalPrice;
                  const surplusDate = getBatchSurplusDate(batch);

                  return (
                    <div key={batch.id} className="relative flex items-center py-1.5 pl-4 group">
                      <div className="absolute left-[-15px] top-[22px] w-4 h-[2px] bg-slate-200"></div>
                      <div className="flex flex-1 items-center justify-between gap-4 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                            {batchTag}
                          </span>
                          <span className="text-xs font-bold text-slate-500 shrink-0">
                            {batch.qty} {t_pcs}
                          </span>
                        </div>

                        <div className="flex items-center gap-6">
                          <span className="text-xs font-bold text-slate-800 shrink-0">
                            Rp {price.toLocaleString("id-ID")}
                          </span>

                          {/* Created At - ONLY visible on prod-1 detail page, to the left of Mulai Surplus */}
                          {product.id === "prod-1" && batch.createdAt && (
                            <div className="flex flex-col text-right min-w-[115px] shrink-0">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Dibuat</span>
                              <span className="text-xs font-semibold text-slate-600">
                                {formatExpiryDateTime(batch.createdAt)}
                              </span>
                            </div>
                          )}

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

                          {/* 3-dot Button for Batch editing */}
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
                                    handleOpenEditBatch(batch);
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
                                    handleDeleteBatch(batch.id);
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
              </div>
            )}
          </div>

          {/* Expired Batches History Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Riwayat Batch Kedaluwarsa ({expiredBatches.length})
            </h4>

            {expiredBatches.length === 0 ? (
              <p className="text-xs text-slate-500 italic pl-4 py-2">Tidak ada riwayat batch kedaluwarsa.</p>
            ) : (
              <div className="relative pl-4 space-y-1 opacity-70">
                <div className="absolute left-[9px] top-2 bottom-[24px] w-[2px] bg-slate-200"></div>
                {expiredBatches.map((batch) => {
                  const batchTag = getBatchTag(batch);

                  return (
                    <div key={batch.id} className="relative flex items-center py-1.5 pl-4 group">
                      <div className="absolute left-[-15px] top-[22px] w-4 h-[2px] bg-slate-200"></div>
                      <div className="flex flex-1 items-center justify-between gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                            {batchTag}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {batch.qty} {t_pcs}
                          </span>
                          <Badge className="bg-red-100 text-red-750 border-red-200 text-[9px] py-0 px-1 font-bold">EXPIRED</Badge>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* Created At - ONLY visible on prod-1 detail page, to the left of Kedaluwarsa */}
                          {product.id === "prod-1" && batch.createdAt && (
                            <div className="flex flex-col text-right min-w-[115px] shrink-0">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Dibuat</span>
                              <span className="text-xs font-semibold text-slate-650">
                                {formatExpiryDateTime(batch.createdAt)}
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col text-right min-w-[110px]">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Kedaluwarsa</span>
                            <span className="text-xs font-bold text-red-650">
                              {formatExpiryDateTime(batch.expiryDate)}
                            </span>
                          </div>

                          {/* 3-dot Button for Batch deletion */}
                          <div className="relative">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-650 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveBatchMenuId(activeBatchMenuId === batch.id ? null : batch.id);
                              }}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            
                            {activeBatchMenuId === batch.id && (
                              <div 
                                className="absolute right-0 mt-1 w-24 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveBatchMenuId(null);
                                    handleDeleteBatch(batch.id);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-red-650 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Batch Modal */}
      {isAddBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-5 border-b bg-emerald-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">
                Tambah Batch Baru untuk <span className="text-resurva-dark">"{name}"</span>
              </h3>
              <button onClick={() => setIsAddBatchOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddBatchSubmit} className="p-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batchQtyInput">Jumlah / Stok</Label>
                <Input
                  id="batchQtyInput"
                  type="number"
                  min={1}
                  value={batchQty}
                  onChange={(e) => setBatchQty(Number(e.target.value))}
                  className="rounded-xl border-slate-200 focus-visible:ring-resurva-dark"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchExpiryInput">Tanggal & Jam Kedaluwarsa</Label>
                <Input
                  id="batchExpiryInput"
                  type="datetime-local"
                  value={batchExpiry}
                  onChange={(e) => handleAddExpiryChange(e.target.value)}
                  className="rounded-xl border-slate-200 focus-visible:ring-resurva-dark"
                  required
                />
              </div>

              {/* Set Surplus Start Date Switch */}
              <div className="flex items-center space-x-2 pt-1.5">
                <Switch
                  id="customSurplusDateEnabledInput"
                  checked={customSurplusDateEnabled}
                  onCheckedChange={(checked) => {
                    setCustomSurplusDateEnabled(checked);
                    const totalTrigHours = (triggerYears * 365 * 24) + (triggerMonths * 30 * 24) + (triggerDays * 24) + triggerHours;
                    if (checked && batchExpiry && totalTrigHours) {
                      const expiryTime = new Date(batchExpiry).getTime();
                      const surplusTime = new Date(expiryTime - totalTrigHours * 60 * 60 * 1000);
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
                <Label htmlFor="customSurplusDateEnabledInput" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Atur Tanggal Mulai Surplus
                </Label>
              </div>

              {customSurplusDateEnabled && (
                <div className="space-y-2 pt-1 animate-none">
                  <Label htmlFor="batchSurplusDateInput" className="flex items-center gap-1 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal & Jam Mulai Surplus
                  </Label>
                  <Input
                    id="batchSurplusDateInput"
                    type="datetime-local"
                    value={batchSurplusDate}
                    onChange={(e) => setBatchSurplusDate(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm focus-visible:ring-resurva-dark"
                    required
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" className="rounded-xl cursor-pointer" onClick={() => setIsAddBatchOpen(false)}>
                  {t_cancelBtn}
                </Button>
                <Button type="submit" className="bg-resurva-dark hover:bg-resurva-dark-light text-white rounded-xl cursor-pointer">
                  {t_saveBtn}
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
                Edit Batch <span className="text-resurva-dark">"{getBatchTag(editingBatch)}"</span>
              </h3>
              <button onClick={() => setEditingBatch(null)} className="text-slate-400 hover:text-slate-600">✕</button>
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
                    const totalTrigHours = (triggerYears * 365 * 24) + (triggerMonths * 30 * 24) + (triggerDays * 24) + triggerHours;
                    if (checked && editingBatchExpiry && totalTrigHours) {
                      const expiryTime = new Date(editingBatchExpiry).getTime();
                      const surplusTime = new Date(expiryTime - totalTrigHours * 60 * 60 * 1000);
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
                <Button type="button" variant="outline" className="rounded-xl cursor-pointer" onClick={() => setEditingBatch(null)}>
                  {t_cancelBtn}
                </Button>
                <Button type="submit" className="bg-resurva-dark hover:bg-resurva-dark-light text-white rounded-xl cursor-pointer">
                  {t_saveBtn}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
