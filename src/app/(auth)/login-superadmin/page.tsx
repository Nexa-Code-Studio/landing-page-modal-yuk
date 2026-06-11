import React from "react";
import { SharedLogin } from "@/components/auth/SharedLogin";

export default function LoginSuperadmin() {
  return (
    <SharedLogin
      roleName="Superadmin"
      subtitle="Sistem Kontrol Pusat Platform"
      cardTitle="Otorisasi Admin"
      cardDesc="Akses terbatas hanya untuk administrator pusat."
      idLabel="Admin ID"
      idPlaceholder="SA-0001"
      redirectUrl="/superadmin/partners"
    />
  );
}
