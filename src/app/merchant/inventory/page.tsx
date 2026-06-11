"use client";

import React, { useState } from "react";
import { useMerchantContext } from "@/lib/contexts/MerchantContext";
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
import { AddProductModal } from "@/components/merchant/AddProductModal";

// Helper function to calculate remaining days
function calculateStatus(expiryDateISO: string) {
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
  const { products } = useMerchantContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Real-Time Expiry Tracker</h2>
          <p className="text-gray-500">
            Kelola inventaris Anda dan pantau tanggal kedaluwarsa secara otomatis.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Tambah Produk Baru
        </Button>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead className="text-right">Harga Asli</TableHead>
              <TableHead className="text-right">Harga Surplus</TableHead>
              <TableHead>Tgl Kedaluwarsa</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  Belum ada produk di inventaris.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const status = calculateStatus(product.expiryDate);
                const expiryDateStr = new Date(product.expiryDate).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">{product.quantity}</TableCell>
                    <TableCell className="text-right">
                      Rp {product.originalPrice.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      Rp {product.surplusPrice.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>{expiryDateStr}</TableCell>
                    <TableCell>
                      <Badge className={`border-transparent ${status.colorClass}`} variant={status.variant as any}>
                        {status.label}
                      </Badge>
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
      />
    </div>
  );
}
