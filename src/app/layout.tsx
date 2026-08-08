import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cửa hàng tiện lợi MiniMart",
  description: "Đặt hàng trực tuyến tại Cửa hàng tiện lợi MiniMart",
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
