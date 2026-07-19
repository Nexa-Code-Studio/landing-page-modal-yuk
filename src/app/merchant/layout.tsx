import type { Metadata } from "next";
import MerchantLayoutClient from "./MerchantLayoutClient";

export const metadata: Metadata = {
  title: "Resurva - Merchant",
};

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MerchantLayoutClient>{children}</MerchantLayoutClient>;
}
