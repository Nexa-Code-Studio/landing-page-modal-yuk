"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { TranslationIcon } from "@hugeicons/core-free-icons";

export interface SharedLoginProps {
  roleName: string;
  subtitle: string;
  cardTitle: string;
  cardDesc: string;
  idLabel: string;
  idPlaceholder: string;
  redirectUrl: string;
}

const loginTranslations = {
  en: {
    Superadmin: {
      subtitle: "Central Platform Control System",
      cardTitle: "Admin Authorization",
      cardDesc: "Restricted access for central administrators only.",
      idLabel: "Admin ID",
      idPlaceholder: "SA-0001",
    },
    Merchant: {
      subtitle: "Sign in to Merchant Partner Portal",
      cardTitle: "Account Login",
      cardDesc: "Please enter your outlet email and password.",
      idLabel: "Email",
      idPlaceholder: "example@outlet.com",
    },
    Enterprise: {
      subtitle: "Multi-Branch Management Portal",
      cardTitle: "Corporate Login",
      cardDesc: "Sign in to monitor waste analytics and SDG reports.",
      idLabel: "Corporate Email",
      idPlaceholder: "admin@resurva-corp.com",
    },
    forgotPassword: "Forgot password?",
    passwordLabel: "Password",
    signInBtn: "Sign In to System",
    needHelp: "Need access help?",
    contactSupport: "Contact Support",
  },
  id: {
    Superadmin: {
      subtitle: "Sistem Kontrol Pusat Platform",
      cardTitle: "Otorisasi Admin",
      cardDesc: "Akses terbatas hanya untuk administrator pusat.",
      idLabel: "Admin ID",
      idPlaceholder: "SA-0001",
    },
    Merchant: {
      subtitle: "Masuk ke Portal Mitra Merchant",
      cardTitle: "Login Akun",
      cardDesc: "Silakan masukkan email dan password outlet Anda.",
      idLabel: "Email",
      idPlaceholder: "contoh@outlet.com",
    },
    Enterprise: {
      subtitle: "Portal Manajemen Multi-Cabang",
      cardTitle: "Login Corporate",
      cardDesc: "Masuk untuk memantau analitik limbah dan laporan SDG.",
      idLabel: "Corporate Email",
      idPlaceholder: "admin@resurva-corp.com",
    },
    forgotPassword: "Lupa password?",
    passwordLabel: "Password",
    signInBtn: "Masuk ke Sistem",
    needHelp: "Butuh bantuan akses?",
    contactSupport: "Hubungi Support",
  }
};

export function SharedLogin({
  roleName,
  subtitle,
  cardTitle,
  cardDesc,
  idLabel,
  idPlaceholder,
  redirectUrl,
}: SharedLoginProps) {
  const [lang, setLang] = React.useState<"en" | "id">("en");

  React.useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage") as "en" | "id" | null;
    if (savedLang) {
      setLang(savedLang);
    } else {
      const systemLang = navigator.language.startsWith("id") ? "id" : "en";
      setLang(systemLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "id" : "en";
    setLang(newLang);
    localStorage.setItem("preferredLanguage", newLang);
  };

  const roleKey = (roleName || "Merchant") as "Superadmin" | "Merchant" | "Enterprise";
  const currentText = loginTranslations[lang][roleKey] || loginTranslations[lang].Merchant;
  const commonText = loginTranslations[lang];

  const style = {
    bg: "bg-resurva-green-muted",
    blob1: "bg-resurva-dark-light",
    blob2: "bg-resurva-gold",
    blob3: "bg-resurva-dark",
    textAccent: "text-resurva-dark",
    textMuted: "text-slate-600",
    cardBg: "bg-white/90",
    cardBorder: "border-0 shadow-xl",
    cardText: "text-slate-900",
    cardDescText: "text-slate-500",
    inputBg: "bg-white",
    inputBorder: "border-slate-200 focus-visible:ring-resurva-dark",
    inputText: "text-slate-900",
    buttonBg: "bg-resurva-dark hover:bg-resurva-dark-light text-white",
    linkAccent: "text-resurva-dark-light",
    mixBlend: "mix-blend-multiply opacity-40",
  };

  return (
    <div className={`min-h-screen ${style.bg} flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="outline"
          size="xs"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 text-xs font-bold text-resurva-dark border-resurva-dark/20 hover:border-resurva-dark hover:bg-resurva-dark/5 transition-all bg-white/80 backdrop-blur-sm"
        >
          <HugeiconsIcon icon={TranslationIcon} size={14} />
          <span>{lang.toUpperCase()}</span>
        </Button>
      </div>

      {/* Decorative blobs */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 ${style.blob1} rounded-full ${style.mixBlend} filter blur-3xl animate-blob`}></div>
      <div className={`absolute top-[-10%] right-[-10%] w-96 h-96 ${style.blob2} rounded-full ${style.mixBlend} filter blur-3xl animate-blob animation-delay-2000`}></div>
      <div className={`absolute bottom-[-20%] left-[20%] w-96 h-96 ${style.blob3} rounded-full ${style.mixBlend} filter blur-3xl animate-blob animation-delay-4000`}></div>

      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold tracking-tight text-resurva-dark flex flex-col items-center gap-1">
            <span>RESURVA</span>
            <span className="text-3xl font-extrabold text-resurva-gold tracking-normal uppercase">
              {roleName}
            </span>
          </h1>
          <p className={`${style.textMuted} mt-3`}>{currentText.subtitle}</p>
        </div>

        <Card className={`${style.cardBorder} ${style.cardBg} backdrop-blur-md ${style.cardText}`}>
          <CardHeader>
            <CardTitle className="text-xl">{currentText.cardTitle}</CardTitle>
            <CardDescription className={style.cardDescText}>
              {currentText.cardDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identity">{currentText.idLabel}</Label>
              <Input 
                id="identity" 
                type={currentText.idLabel.toLowerCase().includes("email") ? "email" : "text"} 
                placeholder={currentText.idPlaceholder} 
                className={`${style.inputBg} ${style.inputBorder} ${style.inputText} placeholder:opacity-50`} 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{commonText.passwordLabel}</Label>
                <Link href="#" className={`text-sm ${style.linkAccent} hover:underline`}>
                  {commonText.forgotPassword}
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className={`${style.inputBg} ${style.inputBorder} ${style.inputText} placeholder:opacity-50`} 
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className={`w-full ${style.buttonBg}`} asChild>
              <Link href={redirectUrl}>{commonText.signInBtn}</Link>
            </Button>
            <div className={`text-center text-sm ${style.textMuted}`}>
              {commonText.needHelp}{" "}
              <Link href="#" className={`${style.linkAccent} hover:underline font-medium`}>
                {commonText.contactSupport}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
