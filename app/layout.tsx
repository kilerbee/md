import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

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
      <body>
        <NextTopLoader />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
