import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReelIntel - Instagram Reels Intelligence for Service Businesses",
  description:
    "AI-powered Instagram Reels analyzer that finds what actually performs for your service business. Get weekly intelligence reports and top-performing video concepts.",
  keywords: [
    "instagram reels",
    "content intelligence",
    "service business",
    "social media analytics",
    "AI content analysis",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#ededed] font-sans">
        {children}
      </body>
    </html>
  );
}
