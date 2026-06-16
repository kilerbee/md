import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muzički Događaji",
  description: "Katalog muzičkih događaja u Srbiji."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  );
}
