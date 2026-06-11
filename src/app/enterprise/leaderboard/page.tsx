"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function LeaderboardPage() {
  const leaderboardData = [
    { rank: 1, name: "Cabang Jakarta Pusat", savedKg: 800, co2e: 4560, rating: "Platinum" },
    { rank: 2, name: "Cabang Surabaya", savedKg: 420, co2e: 2394, rating: "Gold" },
    { rank: 3, name: "Cabang Malang", savedKg: 350, co2e: 1995, rating: "Gold" },
    { rank: 4, name: "Cabang Bandung", savedKg: 290, co2e: 1653, rating: "Silver" },
  ];

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Platinum":
        return "bg-slate-200 text-slate-800 border-slate-400";
      case "Gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Silver":
        return "bg-gray-100 text-gray-600 border-gray-300";
      default:
        return "bg-slate-50 text-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Leaderboard Kinerja Mitra</h2>
        <p className="text-slate-500">
          Peringkat mitra cabang berdasarkan performa reduksi sampah pangan. Digunakan untuk program insentif bulanan.
        </p>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-16 text-center">Peringkat</TableHead>
              <TableHead>Nama Mitra / Cabang</TableHead>
              <TableHead className="text-right">Total Makanan Diselamatkan (Kg)</TableHead>
              <TableHead className="text-right">Emisi Tereduksi (Kg CO2e)</TableHead>
              <TableHead className="text-center">Predikat Program Insentif</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((mitra) => (
              <TableRow key={mitra.name} className="hover:bg-slate-50">
                <TableCell className="text-center font-bold text-lg">
                  {mitra.rank === 1 && "🥇 "}
                  {mitra.rank === 2 && "🥈 "}
                  {mitra.rank === 3 && "🥉 "}
                  {mitra.rank > 3 && `#${mitra.rank}`}
                </TableCell>
                <TableCell className="font-semibold text-slate-800">{mitra.name}</TableCell>
                <TableCell className="text-right font-medium text-emerald-600">
                  {mitra.savedKg.toLocaleString("id-ID")} Kg
                </TableCell>
                <TableCell className="text-right text-slate-600">
                  {mitra.co2e.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={`px-3 py-1 ${getRatingColor(mitra.rating)}`}>
                    {mitra.rating}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
