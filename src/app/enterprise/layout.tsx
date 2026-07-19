import type { Metadata } from "next";
import EnterpriseLayoutClient from "./EnterpriseLayoutClient";

export const metadata: Metadata = {
  title: "Resurva - Enterprise",
};

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EnterpriseLayoutClient>{children}</EnterpriseLayoutClient>;
}
