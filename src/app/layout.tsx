import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cửa hàng trực tuyến",
  description: "Đặt hàng trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hans">
      <body>{children}</body>
    </html>
  );
}
