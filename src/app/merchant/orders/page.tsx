"use client";

import React from "react";
import { useMerchantContext } from "@/lib/contexts/MerchantContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OrdersPage() {
  const { orders } = useMerchantContext();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Mencari Kurir":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Menuju Outlet":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pikap":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Selesai":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Status Logistik & Pesanan</h2>
          <p className="text-gray-500">
            Pantau pesanan surplus yang masuk dan status penjemputan oleh kurir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border rounded-lg bg-white">
            Belum ada pesanan masuk.
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 md:w-1/3 bg-gray-50 border-r border-gray-100 flex flex-col justify-center">
                  <div className="text-sm text-gray-500 mb-1">ID Pesanan: {order.id}</div>
                  <div className="font-bold text-lg mb-2">{order.customerName}</div>
                  <div className="text-sm text-gray-600 mb-4">
                    {new Date(order.createdAt).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="font-semibold text-green-600 text-lg">
                    Rp {order.totalAmount.toLocaleString("id-ID")}
                  </div>
                </div>
                <CardContent className="p-6 md:w-2/3">
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Item Pesanan</h4>
                    <ul className="space-y-2">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500">x{item.qty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Status Logistik</h4>
                    <div className="flex items-center gap-4">
                      <Badge className={`px-3 py-1 ${getStatusColor(order.status)}`} variant="outline">
                        {order.status}
                      </Badge>
                      
                      {order.status === "Mencari Kurir" && (
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Menunggu alokasi kurir terdekat...
                        </div>
                      )}
                      {order.status === "Menuju Outlet" && (
                        <div className="flex items-center text-sm text-blue-600">
                          Kurir sedang dalam perjalanan ke lokasi Anda.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
