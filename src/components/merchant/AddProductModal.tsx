"use client";

import React, { useState, useEffect } from "react";
import { useMerchantContext, Product, VariantGroup, VariantOption } from "@/lib/contexts/MerchantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export function AddProductModal({ isOpen, onClose, productToEdit }: AddProductModalProps) {
  const { addProduct, updateProduct } = useMerchantContext();
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    description: string;
    sku: string;
    quantity: number;
    minStock: number;
    originalPrice: number;
    surplusPrice: number;
    expiryDate: string;
    imageUrl: string;
    isPublished: boolean;
    menuType: "Surplus" | "Reguler";
    variantGroups: VariantGroup[];
  }>({
    name: "",
    category: "",
    description: "",
    sku: "",
    quantity: 1,
    minStock: 5,
    originalPrice: 0,
    surplusPrice: 0,
    expiryDate: "",
    imageUrl: "",
    isPublished: false,
    menuType: "Surplus",
    variantGroups: [],
  });

  useEffect(() => {
    if (isOpen && productToEdit) {
      setFormData({
        name: productToEdit.name || "",
        category: productToEdit.category || "",
        description: productToEdit.description || "",
        sku: productToEdit.sku || "",
        quantity: productToEdit.quantity || 1,
        minStock: productToEdit.minStock || 5,
        originalPrice: productToEdit.originalPrice || 0,
        surplusPrice: productToEdit.surplusPrice || 0,
        expiryDate: productToEdit.expiryDate ? new Date(productToEdit.expiryDate).toISOString().slice(0, 16) : "",
        imageUrl: productToEdit.imageUrl || "",
        isPublished: productToEdit.isPublished || false,
        menuType: productToEdit.menuType || "Surplus",
        variantGroups: productToEdit.variantGroups ? JSON.parse(JSON.stringify(productToEdit.variantGroups)) : [],
      });
    } else if (isOpen) {
      setFormData({
        name: "",
        category: "",
        description: "",
        sku: "",
        quantity: 1,
        minStock: 5,
        originalPrice: 0,
        surplusPrice: 0,
        expiryDate: "",
        imageUrl: "",
        isPublished: false,
        menuType: "Surplus",
        variantGroups: [],
      });
    }
  }, [isOpen, productToEdit]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "originalPrice" || name === "surplusPrice" || name === "minStock"
          ? Number(value)
          : value,
    }));
  };

  const handleToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPublished: checked }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
    }
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
  // ---------------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Nama produk wajib diisi.");
      return;
    }
    
    if (formData.menuType === "Surplus" && !formData.expiryDate) {
      alert("Tanggal Kedaluwarsa wajib diisi untuk menu Surplus.");
      return;
    }
    
    const expiryISO = formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined;

    const productData: any = {
      ...formData,
      expiryDate: expiryISO,
      imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80"
    };

    if (formData.menuType === "Reguler") {
      productData.surplusPrice = formData.originalPrice; // Same price for reguler
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, productData);
    } else {
      addProduct(productData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {productToEdit ? "Edit Produk" : "Tambah Produk Baru"}
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
              {/* Image & Type Column */}
              <div className="w-full md:w-1/3 space-y-4">
                <Label>Gambar Produk</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center h-48 bg-slate-50 relative overflow-hidden">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-1 text-xs text-gray-500">Klik untuk upload</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>

                <div className="space-y-2 pt-2">
                  <Label>Tipe Menu</Label>
                  <select 
                    name="menuType" 
                    value={formData.menuType} 
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Surplus">Menu Surplus (Diskon Sisa)</option>
                    <option value="Reguler">Menu Reguler (Normal)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border rounded-lg p-4 bg-resurva-green-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Tampil di Marketplace</Label>
                    <p className="text-xs text-slate-500">Aktifkan agar user dapat melihat menu ini</p>
                  </div>
                  <Switch checked={formData.isPublished} onCheckedChange={handleToggle} />
                </div>
              </div>

              {/* Form Details Column */}
              <div className="w-full md:w-2/3 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">Nama Produk</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Deskripsi Menu</Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Deskripsikan menu..." rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU / Barcode</Label>
                    <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="Contoh: BKR-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Input id="category" name="category" value={formData.category} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Stok Aktif</Label>
                    <Input id="quantity" name="quantity" type="number" min={0} value={formData.quantity} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Batas Minimum</Label>
                    <Input id="minStock" name="minStock" type="number" min={0} value={formData.minStock} onChange={handleChange} />
                  </div>
                  {formData.menuType === "Surplus" && (
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Kedaluwarsa</Label>
                      <Input id="expiryDate" name="expiryDate" type="datetime-local" value={formData.expiryDate} onChange={handleChange} required />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Harga Normal (Rp)</Label>
                    <Input id="originalPrice" name="originalPrice" type="number" min={0} value={formData.originalPrice} onChange={handleChange} required />
                  </div>
                  {formData.menuType === "Surplus" && (
                    <div className="space-y-2">
                      <Label htmlFor="surplusPrice">Harga Diskon (Rp)</Label>
                      <Input id="surplusPrice" name="surplusPrice" type="number" min={0} value={formData.surplusPrice} onChange={handleChange} required />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Variant Builder Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">Varian & Opsi Tambahan</h3>
                  <p className="text-sm text-slate-500">Contoh: Level Pedas, Pilihan Topping, Ukuran Gelas.</p>
                </div>
                <Button type="button" onClick={addVariantGroup} variant="outline" className="text-resurva-dark border-resurva-dark">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Grup Varian
                </Button>
              </div>

              <div className="space-y-4">
                {formData.variantGroups.map((vg, vgIndex) => (
                  <div key={vg.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label>Nama Grup Varian</Label>
                          <Input 
                            value={vg.name} 
                            onChange={(e) => updateVariantGroup(vg.id, "name", e.target.value)} 
                            placeholder="Contoh: Level Pedas" 
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Wajib Dipilih?</Label>
                          <select 
                            value={vg.isRequired ? "true" : "false"} 
                            onChange={(e) => updateVariantGroup(vg.id, "isRequired", e.target.value === "true")}
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                          >
                            <option value="true">Ya, Wajib (Required)</option>
                            <option value="false">Tidak (Optional)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label>Maksimal Pilihan</Label>
                          <Input 
                            type="number" 
                            min={1} 
                            value={vg.maxSelections} 
                            onChange={(e) => updateVariantGroup(vg.id, "maxSelections", Number(e.target.value))} 
                          />
                        </div>
                      </div>
                      <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto" onClick={() => removeVariantGroup(vg.id)}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    <div className="pl-4 border-l-2 border-slate-200 space-y-3">
                      <Label className="text-slate-500">Daftar Pilihan:</Label>
                      {vg.options.map((opt) => (
                        <div key={opt.id} className="flex gap-3 items-center">
                          <Input 
                            className="flex-1"
                            value={opt.name} 
                            onChange={(e) => updateVariantOption(vg.id, opt.id, "name", e.target.value)} 
                            placeholder="Nama Pilihan (contoh: Ekstra Keju)" 
                            required
                          />
                          <div className="relative w-32">
                            <span className="absolute left-3 top-2.5 text-slate-500 text-sm">Rp</span>
                            <Input 
                              type="number" 
                              className="pl-8"
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
                        <Plus className="w-4 h-4 mr-1" /> Tambah Pilihan
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t flex justify-end gap-3 shrink-0 bg-slate-50 rounded-b-xl">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form="productForm" className="bg-resurva-dark hover:bg-resurva-dark-light text-white">
            {productToEdit ? "Simpan Perubahan" : "Simpan Produk"}
          </Button>
        </div>
      </div>
    </div>
  );
}
