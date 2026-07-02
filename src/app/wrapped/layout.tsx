// Standalone layout untuk /wrapped — tanpa navbar, header, atau sidebar
// Agar halaman ini bisa fullscreen tanpa ada elemen layout Enterprise
export default function WrappedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
