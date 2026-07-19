import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resurva - Enterprise Wrapped 2024",
};

export default function WrappedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
