"use client";

import React, { useState } from "react";
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

export default function InventoryPage() {
  const { products, deleteProduct, updateProduct } = useMerchantContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Real-Time Expiry Tracker</h2>
          <p className="text-gray-500">
            Kelola inventaris Anda dan pantau tanggal kedaluwarsa secara otomatis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsPreviewOpen(true)} variant="outline" className="border-resurva-dark text-resurva-dark hover:bg-resurva-green-muted">
            <Smartphone className="w-4 h-4 mr-2" />
            Preview App
          </Button>
          <Button onClick={handleAddNew} className="bg-resurva-dark hover:bg-resurva-dark-light text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah Produk
          </Button>
        </div>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Gambar</TableHead>
              <TableHead>Nama Produk & SKU</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead className="text-right">Harga Surplus</TableHead>
              <TableHead>Tgl Kedaluwarsa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Marketplace</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  Belum ada produk di inventaris.
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
                  <TableRow key={product.id}>
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
                      <p className="font-medium">{product.name}</p>
                      {product.sku && <p className="text-xs text-slate-500 mt-0.5">{product.sku}</p>}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isLowStock && (
                          <span title="Stok Menipis">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          </span>
                        )}
                        <span className={isLowStock ? "text-orange-600 font-bold" : ""}>{product.quantity}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      Rp {product.surplusPrice.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>{expiryDateStr}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${status.colorClass} border-none`}>
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
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(product)}>
                          <Edit className="w-4 h-4 text-slate-500 hover:text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => deleteProduct(product.id)}>
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
