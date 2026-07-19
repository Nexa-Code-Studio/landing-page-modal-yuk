import type { Metadata } from "next";
import SuperadminLayoutClient from "./SuperadminLayoutClient";

export const metadata: Metadata = {
  title: "Resurva - Superadmin",
};

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperadminLayoutClient>{children}</SuperadminLayoutClient>;
}
