"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const INITIAL_PROFILE = {
  companyName: "PT Resurva Group",
  legalEntity: "Perseroan Terbatas",
  address: "Jl. Raya Cendana No. 12, Malang, Jawa Timur",
  email: "hq@resurva.id",
  phone: "0341-123-4567",
  pic: "Ekya Muhammad H. F.",
  sdgCommitment: "SDG 9 & SDG 17",
  yearFounded: "2025",
};

export default function EnterpriseProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(INITIAL_PROFILE);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setProfile(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Profil Perusahaan</h2>
          <p className="text-slate-500">Informasi legal dan kontak Enterprise yang terdaftar di platform RESURVA.</p>
        </div>
        {!editing ? (
          <Button onClick={() => { setDraft(profile); setEditing(true); }} variant="outline" className="border-slate-300">
            ✏️ Edit Profil
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>Batal</Button>
            <Button onClick={handleSave} className="bg-green-700 hover:bg-green-800 text-white">Simpan Perubahan</Button>
          </div>
        )}
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm font-medium">
          ✅ Profil berhasil diperbarui.
        </div>
      )}

      {/* Avatar + Company Identity */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#0F3D2E] to-[#1A5C44]" />
        <CardContent className="px-8 pb-8">
          <div className="flex items-end gap-5 -mt-10 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-[#EDD099] border-4 border-white shadow-md flex items-center justify-center text-3xl font-black text-[#0F3D2E]">
              {profile.companyName.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{profile.companyName}</h3>
              <p className="text-sm text-slate-500">{profile.legalEntity} · Berdiri {profile.yearFounded}</p>
            </div>
          </div>

          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { key: "companyName", label: "Nama Perusahaan" },
                { key: "legalEntity", label: "Bentuk Badan Hukum" },
                { key: "yearFounded", label: "Tahun Berdiri" },
                { key: "email", label: "Email Korporat" },
                { key: "phone", label: "No. Telepon" },
                { key: "pic", label: "Person in Charge (PIC)" },
                { key: "sdgCommitment", label: "Komitmen SDG" },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <Label htmlFor={f.key}>{f.label}</Label>
                  <Input
                    id={f.key}
                    value={(draft as any)[f.key]}
                    onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  value={draft.address}
                  onChange={e => setDraft(d => ({ ...d, address: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Email Korporat", value: profile.email },
                { label: "No. Telepon", value: profile.phone },
                { label: "Person in Charge", value: profile.pic },
                { label: "Komitmen SDG", value: profile.sdgCommitment },
                { label: "Tahun Berdiri", value: profile.yearFounded },
              ].map(item => (
                <div key={item.label} className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                </div>
              ))}
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Alamat</p>
                <p className="text-sm font-semibold text-slate-800">{profile.address}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Stats (read-only) */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Statistik Platform</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🤝", label: "Total Mitra Aktif", value: "4" },
            { icon: "🍱", label: "Makanan Diselamatkan", value: "1.860 Kg" },
            { icon: "💚", label: "Emisi Tereduksi", value: "10.600 Kg CO₂e" },
            { icon: "💰", label: "Pendapatan Platform", value: "Rp 24,6Jt" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-5 pb-5">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-xl font-black text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
