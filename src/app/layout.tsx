import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "美珍便利店",
  description: "美珍便利店在线订购",
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
