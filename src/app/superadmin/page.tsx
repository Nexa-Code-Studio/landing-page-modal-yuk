import { redirect } from "next/navigation";

export default function SuperadminPage() {
  // Secara otomatis redirect ke halaman partners karena itu adalah dashboard utamanya
  redirect("/superadmin/partners");
}
