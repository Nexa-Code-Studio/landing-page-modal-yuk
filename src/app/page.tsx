"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

// Import UI components from shadcn
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Import Hugeicons and core free icons
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Menu01Icon,
  TranslationIcon,
  ArrowRight01Icon,
  CheckIcon,
  CheckmarkCircle01Icon,
  Megaphone01Icon,
  TagsIcon,
  Recycle01Icon,
  LaptopIcon,
  Leaf01Icon,
  ChartUpIcon,
  LockIcon,
  SecurityIcon,
  TrendingUpDownIcon
} from "@hugeicons/core-free-icons";

// Translation dictionary
const translations = {
  en: {
    nav_saas: "How It Works",
    nav_waste: "Business Model",
    nav_esg: "ESG Impact",
    nav_partner_btn: "Partner With Us",
    hero_badge: "Enterprise Sustainability",
    hero_title_part1: "Turning food waste into",
    hero_title_part2: "revenue & sustainability.",
    hero_desc: "We help food businesses achieve zero food waste, unlock new revenue streams, and convert organic waste into valuable fertilizer.",
    hero_cta_partner: "Partner With Us",
    hero_cta_how: "See How It Works",
    trust_text: "Trusted by Responsible Food Businesses",
    problem_title: "Food waste is an operational inefficiency.",
    problem_desc: "Every year, hospitality businesses lose millions in unsold inventory and disposal fees. Modern consumers demand corporate responsibility. It's time to align operational efficiency with environmental stewardship.",
    process_badge: "The Process",
    process_title: "How our ecosystem works",
    step1_title: "Commit & Brand",
    step1_desc: "Partners advertise their Zero Food Waste commitment to their customers. We provide the necessary sustainability branding and ESG positioning tools.",
    step1_tag: "Elevate brand perception",
    step2_title: "Recover Revenue",
    step2_desc: "Sell near-expiry, high-quality food through our SaaS platform at discounted prices. Generate additional revenue instead of throwing valuable food away.",
    step2_tag: "Increase recovery revenue",
    step3_title: "Recycle & Regenerate",
    step3_desc: "Kitchen staff separate prep waste into our provided organic bins. We collect, replace the bins, and convert the waste into premium organic fertilizer.",
    step3_tag: "Reduce waste up to 70%",
    solutions_badge: "Two Integrated Solutions",
    solutions_title: "Two Partnership Models in One Circular Ecosystem",
    sol_saas_title: "SaaS Food Recovery Platform",
    sol_saas_item1: "Sell near-expiry food.",
    sol_saas_item2: "Manage discounted listings.",
    sol_saas_item3: "Dashboard for sales tracking.",
    sol_saas_item4: "Improve brand reputation.",
    sol_waste_title: "Organic Waste to Fertilizer Program",
    sol_waste_item1: "Free waste bin system.",
    sol_waste_item2: "Scheduled collection.",
    sol_waste_item3: "Waste processing into organic fertilizer.",
    sol_waste_item4: "Contribute to circular economy.",
    benefits_title: "Why industry leaders partner with us",
    benefits_desc: "Transforming waste management from a cost center into a strategic asset.",
    ben1_title: "Financial Returns",
    ben1_desc: "Generate new revenue streams from food that would otherwise be discarded, while simultaneously lowering your municipal waste disposal fees.",
    ben2_title: "ESG Compliance & Data",
    ben2_desc: "Access detailed analytics on your waste reduction and carbon offset. Export audit-ready reports for your annual corporate sustainability disclosures.",
    ben3_title: "Brand Elevation",
    ben3_desc: "Earn the Resurva certification badge. Show your customers, stakeholders, and employees that you are actively building a sustainable future.",
    impact_recov_val: "70%+",
    impact_recov_label: "Organic Waste Reduction Potential",
    impact_meals_val: "30–50%",
    impact_meals_label: "Inventory Value Recovery Potential",
    impact_tons_val: "12-Month",
    impact_tons_label: "ESG Impact Reporting Framework",
    impact_esg_val: "100%",
    impact_esg_label: "Traceable Organic Waste Flow",
    contact_title: "Become a Zero Food Waste Partner",
    contact_desc: "Join a growing network of responsible food businesses transforming waste into opportunity.",
    form_name_label: "Full Name",
    form_business_label: "Business Name",
    form_phone_label: "Phone Number/Email",
    form_city_label: "City",
    form_submit_btn: "Start Partnership",
    form_secure_tag: "Your information is secure.",
    footer_desc: "Closing the loop on commercial food waste through technology and logistics.",
    footer_col_solutions: "Solutions",
    footer_sol_item1: "Surplus Recovery SaaS",
    footer_sol_item2: "Organic Logistics",
    footer_sol_item3: "ESG Reporting API",
    footer_sol_item4: "Pricing",
    footer_col_company: "Company",
    footer_com_item1: "About Us",
    footer_com_item2: "Partner Network",
    footer_com_item3: "Careers",
    footer_com_item4: "Contact",
    footer_col_resources: "Resources",
    footer_res_item1: "Sustainability Blog",
    footer_res_item2: "Case Studies",
    footer_res_item3: "Help Center",
    footer_copy: "© 2026 Resurva Inc. All rights reserved.",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Service",
    login_btn: "Login",
    login_merchant: "Login Merchant",
    login_enterprise: "Login Enterprise",
    login_superadmin: "Login Superadmin",
    select_role: "Select your role to access the dashboard"
  },
  id: {
    nav_saas: "Cara Kerja",
    nav_waste: "Model Bisnis",
    nav_esg: "Dampak ESG",
    nav_partner_btn: "Bermitra Dengan Kami",
    hero_badge: "Keberlanjutan Perusahaan",
    hero_title_part1: "Mengubah limbah makanan menjadi",
    hero_title_part2: "pendapatan & keberlanjutan.",
    hero_desc: "Kami membantu bisnis makanan mencapai nol limbah makanan, membuka aliran pendapatan baru, dan mengubah limbah organik menjadi pupuk berharga.",
    hero_cta_partner: "Bermitra Dengan Kami",
    hero_cta_how: "Lihat Cara Kerjanya",
    trust_text: "Dipercaya oleh Bisnis Makanan yang Bertanggung Jawab",
    problem_title: "Limbah makanan adalah inefisiensi operasional.",
    problem_desc: "Setiap tahun, bisnis hospitalitas kehilangan jutaan dalam inventaris yang tidak terjual dan biaya pembuangan. Konsumen modern menuntut tanggung jawab perusahaan. Saatnya menyelaraskan efisiensi operasional dengan pengelolaan lingkungan.",
    process_badge: "Prosesnya",
    process_title: "Bagaimana ekosistem kami bekerja",
    step1_title: "Komitmen & Branding",
    step1_desc: "Mitra mempromosikan komitmen Nol Limbah Makanan mereka kepada pelanggan. Kami menyediakan branding keberlanjutan dan alat pemosisian ESG yang diperlukan.",
    step1_tag: "Meningkatkan persepsi merek",
    step2_title: "Pulihkan Pendapatan",
    step2_desc: "Jual makanan berkualitas tinggi yang mendekati masa kedaluwarsa melalui platform SaaS kami dengan harga diskon. Hasilkan pendapatan tambahan daripada membuang makanan berharga.",
    step2_tag: "Tingkatkan pemulihan pendapatan",
    step3_title: "Daur Ulang & Regenerasi",
    step3_desc: "Staf dapur memisahkan limbah persiapan ke dalam tempat sampah organik yang kami sediakan. Kami mengumpulkan, mengganti tempat sampah, dan mengubah limbah menjadi pupuk organik premium.",
    step3_tag: "Kurangi limbah hingga 70%",
    solutions_badge: "Dua Solusi Terintegrasi",
    solutions_title: "Dua Model Kemitraan dalam Satu Ekosistem Sirkular",
    sol_saas_title: "Platform Pemulihan Makanan SaaS",
    sol_saas_item1: "Jual makanan hampir kadaluwarsa.",
    sol_saas_item2: "Kelola daftar diskon.",
    sol_saas_item3: "Dashboard untuk pelacakan penjualan.",
    sol_saas_item4: "Tingkatkan reputasi merek.",
    sol_waste_title: "Program Limbah Organik Menjadi Pupuk",
    sol_waste_item1: "Sistem tempat sampah gratis.",
    sol_waste_item2: "Pengambilan terjadwal.",
    sol_waste_item3: "Pemrosesan limbah menjadi pupuk organik.",
    sol_waste_item4: "Berkontribusi pada ekonomi sirkular.",
    benefits_title: "Mengapa pemimpin industri bermitra dengan kami",
    benefits_desc: "Mengubah pengelolaan limbah dari pusat biaya menjadi aset strategis.",
    ben1_title: "Pengembalian Finansial",
    ben1_desc: "Hasilkan aliran pendapatan baru dari makanan yang seharusnya dibuang, sekaligus menurunkan biaya pembuangan limbah kota Anda.",
    ben2_title: "Kepatuhan & Data ESG",
    ben2_desc: "Akses analitik terperinci tentang pengurangan limbah dan pengimbangan karbon Anda. Ekspor laporan siap audit untuk pengungkapan keberlanjutan tahunan perusahaan Anda.",
    ben3_title: "Peningkatan Merek",
    ben3_desc: "Dapatkan lencana sertifikasi Resurva. Tunjukkan kepada pelanggan, pemangku kepentingan, dan karyawan Anda bahwa Anda secara aktif membangun masa depan yang berkelanjutan.",
    impact_recov_val: "70%+",
    impact_recov_label: "Potensi Pengurangan Limbah Organik",
    impact_meals_val: "30–50%",
    impact_meals_label: "Potensi Pemulihan Nilai Inventaris",
    impact_tons_val: "12-Bulan",
    impact_tons_label: "Kerangka Pelaporan Dampak ESG",
    impact_esg_val: "100%",
    impact_esg_label: "Aliran Limbah Organik Terlacak",
    contact_title: "Menjadi Mitra Nol Limbah Makanan",
    contact_desc: "Bergabunglah dengan jaringan bisnis makanan yang bertanggung jawab mengubah limbah menjadi peluang.",
    form_name_label: "Nama Lengkap",
    form_business_label: "Nama Bisnis",
    form_phone_label: "Nomor Telepon/Email",
    form_city_label: "Kota",
    form_submit_btn: "Mulai Kemitraan",
    form_secure_tag: "Informasi Anda aman.",
    footer_desc: "Menutup loop pada limbah makanan komersial melalui teknologi dan logistik.",
    footer_col_solutions: "Solusi",
    footer_sol_item1: "SaaS Pemulihan Surplus",
    footer_sol_item2: "Logistik Organik",
    footer_sol_item3: "API Pelaporan ESG",
    footer_sol_item4: "Harga",
    footer_col_company: "Perusahaan",
    footer_com_item1: "Tentang Kami",
    footer_com_item2: "Jaringan Mitra",
    footer_com_item3: "Karir",
    footer_com_item4: "Kontak",
    footer_col_resources: "Sumber Daya",
    footer_res_item1: "Blog Keberlanjutan",
    footer_res_item2: "Studi Kasus",
    footer_res_item3: "Pusat Bantuan",
    footer_copy: "© 2026 Resurva Inc. Hak cipta dilindungi undang-undang.",
    footer_privacy: "Kebijakan Privasi",
    footer_terms: "Ketentuan Layanan",
    login_btn: "Masuk",
    login_merchant: "Login Merchant",
    login_enterprise: "Login Enterprise",
    login_superadmin: "Login Superadmin",
    select_role: "Pilih peran Anda untuk mengakses dashboard"
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState<"en" | "id">("en");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Form State
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLoginOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Detect system language
    const savedLang = localStorage.getItem("preferredLanguage") as "en" | "id" | null;
    if (savedLang) {
      setLang(savedLang);
    } else {
      const systemLang = navigator.language.startsWith("id") ? "id" : "en";
      setLang(systemLang);
    }

    // Scroll listener for navbar styling
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "id" : "en";
    setLang(newLang);
    localStorage.setItem("preferredLanguage", newLang);
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let message = "";
    if (lang === "id") {
      message = `Halo Tim Resurva,\n\nSaya ingin menjajaki kemitraan di bawah Program Nol Limbah Makanan.\n\nBerikut detail bisnis kami:\n\n• Nama Lengkap: ${name}\n• Nama Bisnis: ${business}\n• Nomor Telepon/Email: ${phone}\n• Kota: ${city}\n\nKami tertarik pada:\n□ Pemulihan Makanan Surplus (Platform SaaS)\n□ Program Limbah Organik Menjadi Pupuk\n□ Kedua Solusi\n\nMohon bagikan langkah selanjutnya, model kemitraan, dan persyaratan operasional.\n\nDitunggu tanggapannya.`;
    } else {
      message = `Hello Resurva Team,\n\nI would like to explore a partnership under the Zero Food Waste Program.\n\nHere are our business details:\n\n• Full Name: ${name}\n• Business Name: ${business}\n• Phone Number/Email: ${phone}\n• City: ${city}\n\nWe are interested in:\n□ Surplus Food Recovery (SaaS Platform)\n□ Organic Waste to Fertilizer Program\n□ Both Solutions\n\nPlease share the next steps, partnership model, and operational requirements.\n\nLooking forward to your response.`;
    }

    const targetWhatsAppNumber = "6281252288955";
    const whatsappUrl = `https://wa.me/${targetWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen font-sans bg-[#F5F1E8] text-[#0F3D2E] selection:bg-[#0F3D2E] selection:text-[#F5F1E8]">
      
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-[#F5F1E8]/95 backdrop-blur-md shadow-sm border-[#0F3D2E]/10 py-4"
            : "bg-[#F5F1E8]/90 backdrop-blur-sm border-[#0F3D2E]/5 py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 overflow-hidden rounded-full ring-2 ring-[#0F3D2E]/10 group-hover:ring-[#0F3D2E]/20 transition-all shadow-sm">
                <Image
                  src="/assets/icon-pmw.webp"
                  alt="Resurva Logo"
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <span className="font-bold text-2xl tracking-tight text-[#0F3D2E] group-hover:text-[#1A5C44] transition-colors">
                Resurva
              </span>
            </Link>

            {/* Desktop Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#platform"
                className="text-sm font-semibold text-[#0F3D2E]/80 hover:text-[#0F3D2E] transition-colors"
              >
                {t.nav_saas}
              </a>
              <a
                href="#waste-management"
                className="text-sm font-semibold text-[#0F3D2E]/80 hover:text-[#0F3D2E] transition-colors"
              >
                {t.nav_waste}
              </a>
              <a
                href="#esg-impact"
                className="text-sm font-semibold text-[#0F3D2E]/80 hover:text-[#0F3D2E] transition-colors"
              >
                {t.nav_esg}
              </a>

              {/* Language Switcher */}
              <Button
                variant="outline"
                size="xs"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0F3D2E]/70 border-[#0F3D2E]/20 hover:border-[#0F3D2E] hover:bg-[#0F3D2E]/5 transition-all"
              >
                <HugeiconsIcon icon={TranslationIcon} size={14} />
                <span>{lang.toUpperCase()}</span>
              </Button>

              {/* Login Action Trigger Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  onClick={() => setIsLoginOpen(!isLoginOpen)}
                  className="bg-[#0F3D2E]/10 text-[#0F3D2E] hover:bg-[#0F3D2E]/20 border border-[#0F3D2E]/10"
                >
                  <HugeiconsIcon icon={LockIcon} size={16} />
                  <span>{t.login_btn}</span>
                </Button>

                {/* Dropdown menu */}
                {isLoginOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white border border-[#0F3D2E]/10 rounded-xl shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="px-4 py-2 border-b border-[#0F3D2E]/5">
                      <p className="text-xs font-semibold text-[#0F3D2E]/50 uppercase tracking-wider">
                        {t.login_btn}
                      </p>
                      <p className="text-[11px] text-[#0F3D2E]/60 mt-0.5">
                        {t.select_role}
                      </p>
                    </div>
                    <div className="p-1.5 space-y-1">
                      <Link
                        href="/login-merchant"
                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-[#0F3D2E] hover:bg-[#0F3D2E]/5 rounded-lg transition-colors group/item"
                      >
                        <span>{t.login_merchant}</span>
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          size={14}
                          className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all"
                        />
                      </Link>
                      <Link
                        href="/login-enterprise"
                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-[#0F3D2E] hover:bg-[#0F3D2E]/5 rounded-lg transition-colors group/item"
                      >
                        <span>{t.login_enterprise}</span>
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          size={14}
                          className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all"
                        />
                      </Link>
                      <Link
                        href="/login-superadmin"
                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-[#0F3D2E] hover:bg-[#0F3D2E]/5 rounded-lg transition-colors group/item"
                      >
                        <span>{t.login_superadmin}</span>
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          size={14}
                          className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Partner CTA Button */}
              <Button asChild className="bg-[#0F3D2E] text-white hover:bg-[#1A5C44] transition-all shadow-sm">
                <a href="#contact">{t.nav_partner_btn}</a>
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-3">
              <Button
                variant="outline"
                size="xs"
                onClick={toggleLanguage}
                className="text-xs font-bold text-[#0F3D2E]/70 border-[#0F3D2E]/20"
              >
                {lang.toUpperCase()}
              </Button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#0F3D2E] hover:text-[#1A5C44] transition-colors p-1"
                aria-label="Toggle Menu"
              >
                <HugeiconsIcon icon={Menu01Icon} size={24} />
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#0F3D2E]/10 bg-[#F5F1E8] px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-3">
              <a
                href="#platform"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-[#0F3D2E]/80 py-1 hover:text-[#0F3D2E]"
              >
                {t.nav_saas}
              </a>
              <a
                href="#waste-management"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-[#0F3D2E]/80 py-1 hover:text-[#0F3D2E]"
              >
                {t.nav_waste}
              </a>
              <a
                href="#esg-impact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-[#0F3D2E]/80 py-1 hover:text-[#0F3D2E]"
              >
                {t.nav_esg}
              </a>
            </div>

            <div className="pt-4 border-t border-[#0F3D2E]/10 space-y-3">
              <p className="text-xs font-semibold text-[#0F3D2E]/50 uppercase tracking-wider">
                {t.login_btn} Options
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Link
                  href="/login-merchant"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-[#0F3D2E]/10 text-sm font-medium"
                >
                  <span>{t.login_merchant}</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                </Link>
                <Link
                  href="/login-enterprise"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-[#0F3D2E]/10 text-sm font-medium"
                >
                  <span>{t.login_enterprise}</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                </Link>
                <Link
                  href="/login-superadmin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-[#0F3D2E]/10 text-sm font-medium"
                >
                  <span>{t.login_superadmin}</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                </Link>
              </div>

              <Button asChild className="w-full mt-2 bg-[#0F3D2E] text-white">
                <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>
                  {t.nav_partner_btn}
                </a>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-36 overflow-hidden text-white bg-[#0F3D2E]">
        {/* Background Image & Green Gradient Overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Commercial Kitchen Background"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F3D2E] via-[#0F3D2E]/95 to-[#0F3D2E]/80 mix-blend-multiply" />
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-15 z-0" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, #F5F1E8 1.5px, transparent 0)",
          backgroundSize: "40px 40px"
        }} />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F1E8]/10 border border-[#F5F1E8]/20 text-[#F5F1E8]/90 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#EDD099]" />
              <span>{t.hero_badge}</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              {t.hero_title_part1} <br/>
              <span className="bg-gradient-to-r from-[#EDD099] to-[#F5E2BC] bg-clip-text text-transparent">
                {t.hero_title_part2}
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-[#F5F1E8]/90 mb-10 max-w-2xl leading-relaxed font-light">
              {t.hero_desc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-[#EDD099] text-[#0F3D2E] hover:bg-[#F5E2BC] transition-all font-semibold shadow-lg group">
                <a href="#contact">
                  <span>{t.hero_cta_partner}</span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 transition-all font-medium backdrop-blur-sm">
                <a href="#platform">{t.hero_cta_how}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 bg-white border-b border-[#0F3D2E]/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-xs font-bold text-[#0F3D2E]/50 uppercase tracking-widest mb-6">
            {t.trust_text}
          </p>
          <div className="flex flex-wrap justify-center gap-12 lg:gap-24 opacity-75 hover:opacity-100 transition-all duration-300">
            {/* Mitra Logo */}
            <div className="flex items-center gap-3 font-bold text-lg text-[#0F3D2E] hover:text-[#1A5C44] transition-colors duration-300 cursor-pointer">
              <div className="relative w-10 h-10 overflow-hidden rounded-full ring-1 ring-[#0F3D2E]/10">
                <Image
                  src="/assets/mitra/rumah-syrian.webp"
                  alt="Rumah Syrian Malang"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <span className="tracking-wide">Rumah Syrian Malang</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 bg-[#F5F1E8] relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: "linear-gradient(to right, #0F3D2E 1px, transparent 1px), linear-gradient(to bottom, #0F3D2E 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0F3D2E] mb-6 tracking-tight">
            {t.problem_title}
          </h2>
          <div className="w-16 h-1 bg-[#EDD099] mx-auto mb-6 rounded-full" />
          <p className="text-lg lg:text-xl text-[#0F3D2E]/70 leading-relaxed font-light">
            {t.problem_desc}
          </p>
        </div>
      </section>

      {/* How Our Ecosystem Works */}
      <section className="py-24 bg-white border-y border-[#0F3D2E]/5" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[#EDD099] font-extrabold tracking-widest uppercase text-xs block mb-3">
              {t.process_badge}
            </span>
            <h3 className="text-3xl lg:text-4xl font-bold text-[#0F3D2E] tracking-tight">
              {t.process_title}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
            {/* Connecting Line (Desktop Only) */}
            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-[2px] border-t-2 border-dashed border-[#0F3D2E]/10 z-0" />

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-[#F5F1E8] rounded-full border-4 border-white shadow-md flex items-center justify-center mb-6 relative group-hover:scale-105 transition-transform">
                <span className="absolute -top-1 -right-1 w-8 h-8 bg-[#0F3D2E] text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
                  1
                </span>
                <HugeiconsIcon icon={Megaphone01Icon} size={36} className="text-[#0F3D2E]" />
              </div>
              <h4 className="text-xl font-bold text-[#0F3D2E] mb-3">{t.step1_title}</h4>
              <p className="text-[#0F3D2E]/70 leading-relaxed mb-5 text-sm max-w-xs">
                {t.step1_desc}
              </p>
              <div className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F3D2E] bg-[#F5E2BC] px-4 py-1.5 rounded-full">
                <HugeiconsIcon icon={CheckIcon} size={12} />
                <span>{t.step1_tag}</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-[#F5F1E8] rounded-full border-4 border-white shadow-md flex items-center justify-center mb-6 relative group-hover:scale-105 transition-transform">
                <span className="absolute -top-1 -right-1 w-8 h-8 bg-[#0F3D2E] text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
                  2
                </span>
                <HugeiconsIcon icon={TagsIcon} size={36} className="text-[#0F3D2E]" />
              </div>
              <h4 className="text-xl font-bold text-[#0F3D2E] mb-3">{t.step2_title}</h4>
              <p className="text-[#0F3D2E]/70 leading-relaxed mb-5 text-sm max-w-xs">
                {t.step2_desc}
              </p>
              <div className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F3D2E] bg-[#F5E2BC] px-4 py-1.5 rounded-full">
                <HugeiconsIcon icon={TrendingUpDownIcon} size={12} />
                <span>{t.step2_tag}</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-[#F5F1E8] rounded-full border-4 border-white shadow-md flex items-center justify-center mb-6 relative group-hover:scale-105 transition-transform">
                <span className="absolute -top-1 -right-1 w-8 h-8 bg-[#0F3D2E] text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
                  3
                </span>
                <HugeiconsIcon icon={Recycle01Icon} size={36} className="text-[#0F3D2E]" />
              </div>
              <h4 className="text-xl font-bold text-[#0F3D2E] mb-3">{t.step3_title}</h4>
              <p className="text-[#0F3D2E]/70 leading-relaxed mb-5 text-sm max-w-xs">
                {t.step3_desc}
              </p>
              <div className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F3D2E] bg-[#F5E2BC] px-4 py-1.5 rounded-full">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} />
                <span>{t.step3_tag}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Two Integrated Solutions */}
      <section className="py-24 bg-[#E8E2D5]" id="platform">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#0F3D2E]/60 font-extrabold tracking-widest uppercase text-xs block mb-3">
              {t.solutions_badge}
            </span>
            <h3 className="text-3xl lg:text-4xl font-bold text-[#0F3D2E] tracking-tight">
              {t.solutions_title}
            </h3>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-[#0F3D2E]/5 overflow-hidden">
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#0F3D2E]/10">
              
              {/* Left Solution Card */}
              <div className="p-10 lg:p-14 hover:bg-[#F5F1E8]/30 transition-colors">
                <div className="w-14 h-14 bg-[#0F3D2E]/5 rounded-xl flex items-center justify-center mb-8 border border-[#0F3D2E]/10 shadow-sm">
                  <HugeiconsIcon icon={LaptopIcon} size={28} className="text-[#0F3D2E]" />
                </div>
                <h4 className="text-2xl font-bold text-[#0F3D2E] mb-6">{t.sol_saas_title}</h4>
                <ul className="space-y-4">
                  {[t.sol_saas_item1, t.sol_saas_item2, t.sol_saas_item3, t.sol_saas_item4].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#0F3D2E]/80">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} className="text-[#EDD099] shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Solution Card */}
              <div className="p-10 lg:p-14 hover:bg-[#F5F1E8]/30 transition-colors" id="waste-management">
                <div className="w-14 h-14 bg-[#EDD099]/10 rounded-xl flex items-center justify-center mb-8 border border-[#EDD099]/20 shadow-sm">
                  <HugeiconsIcon icon={Leaf01Icon} size={28} className="text-[#0F3D2E]" />
                </div>
                <h4 className="text-2xl font-bold text-[#0F3D2E] mb-6">{t.sol_waste_title}</h4>
                <ul className="space-y-4">
                  {[t.sol_waste_item1, t.sol_waste_item2, t.sol_waste_item3, t.sol_waste_item4].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#0F3D2E]/80">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} className="text-[#EDD099] shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h3 className="text-3xl font-bold text-[#0F3D2E] tracking-tight mb-4">
              {t.benefits_title}
            </h3>
            <p className="text-[#0F3D2E]/60 text-lg leading-relaxed font-light">
              {t.benefits_desc}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            
            {/* Benefit 1 */}
            <div className="hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 border-2 border-[#EDD099] rounded-full flex items-center justify-center mb-6 bg-[#EDD099]/5 shadow-sm">
                <HugeiconsIcon icon={TrendingUpDownIcon} size={20} className="text-[#0F3D2E]" />
              </div>
              <h4 className="text-xl font-bold text-[#0F3D2E] mb-3">{t.ben1_title}</h4>
              <p className="text-[#0F3D2E]/70 leading-relaxed text-sm">
                {t.ben1_desc}
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 border-2 border-[#EDD099] rounded-full flex items-center justify-center mb-6 bg-[#EDD099]/5 shadow-sm">
                <HugeiconsIcon icon={ChartUpIcon} size={20} className="text-[#0F3D2E]" />
              </div>
              <h4 className="text-xl font-bold text-[#0F3D2E] mb-3">{t.ben2_title}</h4>
              <p className="text-[#0F3D2E]/70 leading-relaxed text-sm">
                {t.ben2_desc}
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 border-2 border-[#EDD099] rounded-full flex items-center justify-center mb-6 bg-[#EDD099]/5 shadow-sm">
                <HugeiconsIcon icon={SecurityIcon} size={20} className="text-[#0F3D2E]" />
              </div>
              <h4 className="text-xl font-bold text-[#0F3D2E] mb-3">{t.ben3_title}</h4>
              <p className="text-[#0F3D2E]/70 leading-relaxed text-sm">
                {t.ben3_desc}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-20 bg-[#0F3D2E] text-white border-y border-[#EDD099]/20" id="esg-impact">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            
            <div className="py-8 px-4 flex flex-col justify-center">
              <div className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#EDD099] to-[#F5E2BC] bg-clip-text text-transparent mb-2">
                {t.impact_recov_val}
              </div>
              <div className="text-xs font-bold text-[#F5F1E8]/80 uppercase tracking-wider leading-relaxed">
                {t.impact_recov_label}
              </div>
            </div>

            <div className="py-8 px-4 flex flex-col justify-center">
              <div className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#EDD099] to-[#F5E2BC] bg-clip-text text-transparent mb-2">
                {t.impact_meals_val}
              </div>
              <div className="text-xs font-bold text-[#F5F1E8]/80 uppercase tracking-wider leading-relaxed">
                {t.impact_meals_label}
              </div>
            </div>

            <div className="py-8 px-4 flex flex-col justify-center">
              <div className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#EDD099] to-[#F5E2BC] bg-clip-text text-transparent mb-2">
                {t.impact_tons_val}
              </div>
              <div className="text-xs font-bold text-[#F5F1E8]/80 uppercase tracking-wider leading-relaxed">
                {t.impact_tons_label}
              </div>
            </div>

            <div className="py-8 px-4 flex flex-col justify-center">
              <div className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#EDD099] to-[#F5E2BC] bg-clip-text text-transparent mb-2">
                {t.impact_esg_val}
              </div>
              <div className="text-xs font-bold text-[#F5F1E8]/80 uppercase tracking-wider leading-relaxed">
                {t.impact_esg_label}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Partnership Form Section */}
      <section className="py-24 bg-white relative overflow-hidden" id="contact">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, #0F3D2E 1.5px, transparent 0)",
          backgroundSize: "40px 40px"
        }} />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0F3D2E] mb-6 tracking-tight">
            {t.contact_title}
          </h2>
          <p className="text-base sm:text-lg text-[#0F3D2E]/70 mb-12 max-w-2xl mx-auto font-light">
            {t.contact_desc}
          </p>

          <Card className="max-w-xl mx-auto text-left relative overflow-hidden shadow-2xl border border-[#0F3D2E]/5 rounded-2xl bg-white">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0F3D2E]" />
            <CardHeader className="pt-8 pb-4">
              <CardTitle className="text-lg font-bold text-[#0F3D2E]">{t.nav_partner_btn}</CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <form onSubmit={handleWhatsAppSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="partner-name" className="text-sm font-semibold text-[#0F3D2E]/80">
                      {t.form_name_label}
                    </Label>
                    <Input
                      id="partner-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-[#0F3D2E]/20 bg-[#F5F1E8]/35 text-[#0F3D2E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDD099] focus-visible:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="partner-business" className="text-sm font-semibold text-[#0F3D2E]/80">
                      {t.form_business_label}
                    </Label>
                    <Input
                      id="partner-business"
                      type="text"
                      required
                      value={business}
                      onChange={(e) => setBusiness(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-[#0F3D2E]/20 bg-[#F5F1E8]/35 text-[#0F3D2E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDD099] focus-visible:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="partner-phone" className="text-sm font-semibold text-[#0F3D2E]/80">
                    {t.form_phone_label}
                  </Label>
                  <Input
                    id="partner-phone"
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[#0F3D2E]/20 bg-[#F5F1E8]/35 text-[#0F3D2E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDD099] focus-visible:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="partner-city" className="text-sm font-semibold text-[#0F3D2E]/80">
                    {t.form_city_label}
                  </Label>
                  <Input
                    id="partner-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[#0F3D2E]/20 bg-[#F5F1E8]/35 text-[#0F3D2E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDD099] focus-visible:border-transparent transition-all"
                  />
                </div>

                <Button type="submit" className="w-full mt-2 px-5 py-6 bg-[#0F3D2E] text-white font-semibold rounded-lg hover:bg-[#1A5C44] transition-all shadow-md flex items-center justify-center gap-2 group text-sm">
                  <span>{t.form_submit_btn}</span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Button>

                <p className="text-[11px] text-center text-[#0F3D2E]/50 mt-4 flex items-center justify-center gap-1.5">
                  <HugeiconsIcon icon={LockIcon} size={12} className="text-[#0F3D2E]/50" />
                  <span>{t.form_secure_tag}</span>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F3D2E] pt-20 pb-8 text-[#F5F1E8]/60 border-t border-[#EDD099]/25">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16 border-b border-[#F5F1E8]/10 pb-16">
            <div className="col-span-2 md:col-span-1 space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative w-8 h-8 overflow-hidden rounded-full ring-1 ring-white/10">
                  <Image
                    src="/assets/icon-pmw.webp"
                    alt="Resurva Logo"
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">Resurva</span>
              </Link>
              <p className="text-xs leading-relaxed max-w-xs">{t.footer_desc}</p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-5 uppercase text-xs tracking-wider">
                {t.footer_col_solutions}
              </h4>
              <ul className="space-y-3.5 text-xs">
                <li><a href="#" className="hover:text-[#EDD099] transition-colors">{t.footer_sol_item1}</a></li>
                <li><a href="#" className="hover:text-[#EDD099] transition-colors">{t.footer_sol_item2}</a></li>
                <li><a href="#" className="hover:text-[#EDD099] transition-colors">{t.footer_sol_item3}</a></li>
                <li><a href="#" className="hover:text-[#EDD099] transition-colors">{t.footer_sol_item4}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-5 uppercase text-xs tracking-wider">
                {t.footer_col_company}
              </h4>
              <ul className="space-y-3.5 text-xs">
                <li><a href="#" className="hover:text-[#EDD099] transition-colors">{t.footer_com_item1}</a></li>
                <li><a href="#" className="hover:text-[#EDD099] transition-colors">{t.footer_com_item2}</a></li>
                <li><a href="#" className="hover:text-[#EDD099] transition-colors">{t.footer_com_item3}</a></li>
                <li><a href="#" className="hover:text-[#EDD099] transition-colors">{t.footer_com_item4}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-5 uppercase text-xs tracking-wider">
                {t.footer_col_resources}
              </h4>
              <ul className="space-y-3.5 text-xs">
                <li><a href="#" className="hover:text-[#EDD099] transition-colors">{t.footer_res_item1}</a></li>
                <li><a href="#" className="hover:text-[#EDD099] transition-colors">{t.footer_res_item2}</a></li>
                <li><a href="#" className="hover:text-[#EDD099] transition-colors">{t.footer_res_item3}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center text-[11px] space-y-4 md:space-y-0">
            <p>{t.footer_copy}</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#EDD099] transition-colors">{t.footer_privacy}</a>
              <a href="#" className="hover:text-[#EDD099] transition-colors">{t.footer_terms}</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}