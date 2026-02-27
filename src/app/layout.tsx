import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Divergent Thinking",
  description: "Train your creative thinking by listing uses for random objects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
