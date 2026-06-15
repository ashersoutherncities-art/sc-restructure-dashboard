import type { Metadata } from "next";
import "./globals.css";
import { ActingAsProvider } from "@/components/ActingAsProvider";

export const metadata: Metadata = {
  title: "SC Restructure Dashboard",
  description: "Southern Cities Enterprises 2026 Portfolio Restructuring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ActingAsProvider>{children}</ActingAsProvider>
      </body>
    </html>
  );
}
