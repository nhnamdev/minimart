import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cửa hàng trực tuyến",
  description: "Đặt hàng trực tuyến",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" translate="no" className="notranslate">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body>{children}</body>
    </html>
  );
}
