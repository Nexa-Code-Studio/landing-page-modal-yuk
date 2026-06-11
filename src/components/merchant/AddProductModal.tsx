"use client";

import React, { useState } from "react";
import { useMerchantContext } from "@/lib/contexts/MerchantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const { addProduct } = useMerchantContext();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 1,
    originalPrice: 0,
    surplusPrice: 0,
    expiryDate: "",
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "originalPrice" || name === "surplusPrice"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.expiryDate) {
      alert("Nama produk dan Tanggal Kedaluwarsa wajib diisi.");
      return;
    }
    
    // Convert local date string to ISO date
    const expiryISO = new Date(formData.expiryDate).toISOString();

    addProduct({
      ...formData,
      expiryDate: expiryISO,
    });
    
    // Reset form
    setFormData({
      name: "",
      category: "",
      quantity: 1,
      originalPrice: 0,
      surplusPrice: 0,
      expiryDate: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Tambah Produk Baru</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Roti Cokelat"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Contoh: Bakery"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah Stok</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Tgl. Kedaluwarsa</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="datetime-local"
                value={formData.expiryDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Harga Asli (Rp)</Label>
              <Input
                id="originalPrice"
                name="originalPrice"
                type="number"
                min={0}
                value={formData.originalPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surplusPrice">Harga Surplus (Rp)</Label>
              <Input
                id="surplusPrice"
                name="surplusPrice"
                type="number"
                min={0}
                value={formData.surplusPrice}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Simpan Produk
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
