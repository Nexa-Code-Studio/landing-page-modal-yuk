import React from "react";
import { SharedLogin } from "@/components/auth/SharedLogin";

export default function LoginMerchant() {
  return (
    <SharedLogin
      roleName="Merchant"
      subtitle="Masuk ke Portal Mitra Merchant"
      cardTitle="Login Akun"
      cardDesc="Silakan masukkan email dan password outlet Anda."
      idLabel="Email"
      idPlaceholder="contoh@outlet.com"
      redirectUrl="/merchant"
    />
  );
}
