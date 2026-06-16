import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muzički Događaji",
  description: "A catalog of music events in Serbia."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
