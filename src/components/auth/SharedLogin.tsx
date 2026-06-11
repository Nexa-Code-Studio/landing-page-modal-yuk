import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export interface SharedLoginProps {
  roleName: string;
  subtitle: string;
  cardTitle: string;
  cardDesc: string;
  idLabel: string;
  idPlaceholder: string;
  redirectUrl: string;
}

export function SharedLogin({
  roleName,
  subtitle,
  cardTitle,
  cardDesc,
  idLabel,
  idPlaceholder,
  redirectUrl,
}: SharedLoginProps) {
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
      {/* Decorative blobs */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 ${style.blob1} rounded-full ${style.mixBlend} filter blur-3xl animate-blob`}></div>
      <div className={`absolute top-[-10%] right-[-10%] w-96 h-96 ${style.blob2} rounded-full ${style.mixBlend} filter blur-3xl animate-blob animation-delay-2000`}></div>
      <div className={`absolute bottom-[-20%] left-[20%] w-96 h-96 ${style.blob3} rounded-full ${style.mixBlend} filter blur-3xl animate-blob animation-delay-4000`}></div>

      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className={`text-5xl font-extrabold tracking-tight text-resurva-dark`}>
            RESURVA <span className={"font-light text-resurva-gold"}>{roleName && roleName !== "Merchant" ? roleName : ""}</span>
          </h1>
          <p className={`${style.textMuted} mt-2`}>{subtitle}</p>
        </div>

        <Card className={`${style.cardBorder} ${style.cardBg} backdrop-blur-md ${style.cardText}`}>
          <CardHeader>
            <CardTitle className="text-xl">{cardTitle}</CardTitle>
            <CardDescription className={style.cardDescText}>
              {cardDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identity">{idLabel}</Label>
              <Input 
                id="identity" 
                type={idLabel.toLowerCase().includes("email") ? "email" : "text"} 
                placeholder={idPlaceholder} 
                className={`${style.inputBg} ${style.inputBorder} ${style.inputText} placeholder:opacity-50`} 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className={`text-sm ${style.linkAccent} hover:underline`}>
                  Lupa password?
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
              <Link href={redirectUrl}>Masuk ke Sistem</Link>
            </Button>
            <div className={`text-center text-sm ${style.textMuted}`}>
              Butuh bantuan akses?{" "}
              <Link href="#" className={`${style.linkAccent} hover:underline font-medium`}>
                Hubungi Support
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
