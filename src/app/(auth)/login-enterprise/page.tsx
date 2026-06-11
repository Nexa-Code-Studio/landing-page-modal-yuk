import React from "react";
import { SharedLogin } from "@/components/auth/SharedLogin";

export default function LoginEnterprise() {
  return (
    <SharedLogin
      roleName="Enterprise"
      subtitle="Portal Manajemen Multi-Cabang"
      cardTitle="Login Corporate"
      cardDesc="Masuk untuk memantau analitik limbah dan laporan SDG."
      idLabel="Corporate Email"
      idPlaceholder="admin@resurva-corp.com"
      redirectUrl="/enterprise/analytics"
    />
  );
}
