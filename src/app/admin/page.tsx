import type { Metadata } from "next";

import { AdminApp } from "@/components/admin/AdminApp";

export const metadata: Metadata = {
  title: "商店管理后台",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
