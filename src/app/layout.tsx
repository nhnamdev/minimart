import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cửa hàng tiện lợi Thỏ Nhỏ",
  description: "Đặt hàng trực tuyến tại Cửa hàng tiện lợi Thỏ Nhỏ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
