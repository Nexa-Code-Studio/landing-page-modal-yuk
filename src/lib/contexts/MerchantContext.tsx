"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type ProductStatus = "Aman" | "Surplus" | "Flash Sale";

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  originalPrice: number;
  surplusPrice: number;
  expiryDate: string; // ISO string e.g. "2026-06-15"
  status?: ProductStatus;
}

export type OrderStatus = "Mencari Kurir" | "Menuju Outlet" | "Pikap" | "Selesai";

export interface Order {
  id: string;
  customerName: string;
  items: { name: string; qty: number }[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

interface MerchantContextProps {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  orders: Order[];
}

const MerchantContext = createContext<MerchantContextProps | undefined>(undefined);

export function MerchantProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "prod-1",
      name: "Roti Cokelat",
      category: "Bakery",
      quantity: 10,
      originalPrice: 15000,
      surplusPrice: 7500,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), // 12 hours from now (Flash Sale)
    },
    {
      id: "prod-2",
      name: "Nasi Goreng Ayam",
      category: "Makanan Berat",
      quantity: 5,
      originalPrice: 25000,
      surplusPrice: 15000,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now (Surplus)
    },
    {
      id: "prod-3",
      name: "Kopi Susu Gula Aren",
      category: "Minuman",
      quantity: 20,
      originalPrice: 20000,
      surplusPrice: 10000,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now (Aman)
    },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001",
      customerName: "Budi Santoso",
      items: [{ name: "Roti Cokelat", qty: 2 }],
      totalAmount: 15000,
      status: "Mencari Kurir",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ORD-002",
      customerName: "Siti Aminah",
      items: [{ name: "Nasi Goreng Ayam", qty: 1 }],
      totalAmount: 15000,
      status: "Menuju Outlet",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
  ]);

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  return (
    <MerchantContext.Provider value={{ products, addProduct, orders }}>
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchantContext() {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error("useMerchantContext must be used within a MerchantProvider");
  }
  return context;
}
