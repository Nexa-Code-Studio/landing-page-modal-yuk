"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Globe, Info, Target, Calendar } from "lucide-react";

const INITIAL_PROFILE = {
  companyName: "PT Resurva Group",
  legalEntity: "Perseroan Terbatas",
  address: "Jl. Raya Cendana No. 12, Malang, Jawa Timur",
  email: "hq@resurva.id",
  phone: "0341-123-4567",
  pic: "Ekya Muhammad H. F.",
  sdgCommitment: "SDG 9 & SDG 17",
  yearFounded: "2025",
  logoUrl: "",
  description: "Platform teknologi inovatif yang menghubungkan merchant dengan pelanggan untuk mengurangi food waste dan mendukung keberlanjutan lingkungan. Kami berkomitmen untuk membangun ekosistem sirkular ekonomi yang memberi manfaat nyata bagi masyarakat.",
  website: "https://resurva.id",
};

export default function EnterpriseProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(INITIAL_PROFILE);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
  };

  const renderEditModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-1">Edit Profil Perusahaan</h3>
          <p className="text-sm text-slate-500 mb-6">Perbarui informasi, logo, dan deskripsi Enterprise Anda.</p>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Logo / Foto Profil</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 relative group hover:bg-slate-100 transition-colors cursor-pointer">
                  {draft.logoUrl ? (
                    <img src={draft.logoUrl} alt="Logo" className="w-24 h-24 rounded-full object-cover shadow-sm border border-slate-200 mb-3" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-3">
                      <Target className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <p className="text-xs text-slate-500 text-center font-medium group-hover:text-slate-700 transition-colors">
                    Klik atau Tarik gambar ke sini untuk mengunggah
                  </p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const url = URL.createObjectURL(file);
                        setDraft(d => ({ ...d, logoUrl: url }));
                      }
                    }} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Nama Perusahaan</Label>
                <Input id="companyName" value={draft.companyName} onChange={e => setDraft(d => ({ ...d, companyName: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legalEntity">Bentuk Badan Hukum</Label>
                <Input id="legalEntity" value={draft.legalEntity} onChange={e => setDraft(d => ({ ...d, legalEntity: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Korporat</Label>
                <Input id="email" type="email" value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input id="phone" value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pic">Person in Charge (PIC)</Label>
                <Input id="pic" value={draft.pic} onChange={e => setDraft(d => ({ ...d, pic: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearFounded">Tahun Berdiri</Label>
                <Input id="yearFounded" value={draft.yearFounded} onChange={e => setDraft(d => ({ ...d, yearFounded: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website Resmi</Label>
                <Input id="website" placeholder="https://..." value={draft.website} onChange={e => setDraft(d => ({ ...d, website: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sdgCommitment">Komitmen SDG</Label>
                <Input id="sdgCommitment" value={draft.sdgCommitment} onChange={e => setDraft(d => ({ ...d, sdgCommitment: e.target.value }))} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Input id="address" value={draft.address} onChange={e => setDraft(d => ({ ...d, address: e.target.value }))} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Deskripsi Perusahaan</Label>
                <textarea 
                  id="description" 
                  rows={4}
                  className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={draft.description} 
                  onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={handleCancel}>Batal</Button>
              <Button type="submit" className="bg-green-700 hover:bg-green-800 text-white">Simpan Perubahan</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Profil Perusahaan</h2>
          <p className="text-slate-500">Informasi legal, deskripsi, dan kontak Enterprise yang terdaftar.</p>
        </div>
        <Button onClick={() => { setDraft(profile); setEditing(true); }} variant="outline" className="border-slate-300">
          ✏️ Edit Profil
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300">
          ✅ Profil berhasil diperbarui.
        </div>
      )}

      {/* Profile Card (2 Columns Layout) */}
      <Card className="overflow-hidden border-slate-200 shadow-sm p-0 rounded-2xl">
        {/* Green Banner flush to the top */}
        <div className="h-32 w-full bg-gradient-to-r from-[#0F3D2E] to-[#1A5C44]" />
        
        <div className="px-6 md:px-10 pb-10">
          {/* Avatar floating over banner */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-[#EDD099] border-4 border-white shadow-md flex shrink-0 items-center justify-center text-4xl font-black text-[#0F3D2E] overflow-hidden">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                profile.companyName.charAt(0)
              )}
            </div>
            <div className="pb-2">
              <h3 className="text-2xl font-bold text-slate-900">{profile.companyName}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{profile.legalEntity}</span>
                <span>·</span>
                <span>Berdiri {profile.yearFounded}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Basic Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <h4 className="font-bold text-slate-800 border-b pb-2">Kontak & Lokasi</h4>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-slate-100 rounded-xl shrink-0"><Mail className="w-4 h-4 text-slate-600" /></div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Korporat</p>
                    <p className="text-sm font-medium text-slate-900">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-slate-100 rounded-xl shrink-0"><Phone className="w-4 h-4 text-slate-600" /></div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">No. Telepon</p>
                    <p className="text-sm font-medium text-slate-900">{profile.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-slate-100 rounded-xl shrink-0"><MapPin className="w-4 h-4 text-slate-600" /></div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Alamat Lengkap</p>
                    <p className="text-sm font-medium text-slate-900 leading-relaxed pr-4">{profile.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Bio, Web, SDG */}
            <div className="lg:col-span-7 space-y-6">
              <h4 className="font-bold text-slate-800 border-b pb-2">Tentang Perusahaan</h4>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-700 leading-relaxed text-justify">
                    {profile.description || <span className="italic text-slate-400">Belum ada deskripsi perusahaan.</span>}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Website Resmi</p>
                    {profile.website ? (
                      <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        <Globe className="w-4 h-4" /> {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-500">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Person in Charge</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                       <Info className="w-4 h-4 text-slate-400" /> {profile.pic}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Komitmen Keberlanjutan</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-100/50 px-3 py-2 rounded-lg border border-emerald-200 w-fit">
                       <Target className="w-4 h-4" /> {profile.sdgCommitment}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Platform Stats */}
      <div className="pt-4">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Statistik Platform</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "🤝", label: "Total Mitra Aktif", value: "4" },
            { icon: "🍱", label: "Makanan Diselamatkan", value: "1.860 Kg" },
            { icon: "💚", label: "Emisi Tereduksi", value: "10.600 Kg CO₂e" },
            { icon: "💰", label: "Pendapatan Platform", value: "Rp 24,6Jt" },
          ].map(s => (
            <Card key={s.label} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="text-2xl font-black text-slate-900">{s.value}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {editing && renderEditModal()}
    </div>
  );
}
