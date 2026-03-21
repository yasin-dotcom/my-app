import type { Metadata } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReelScanner - TikTok Viral Content Analyzer",
  description:
    "Search TikTok for viral content, pull transcripts, and visually analyze what's getting views.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#ededed] font-sans">
        <Header />
        <main className="flex-1 pt-20">{children}</main>
      </body>
    </html>
  );
}
