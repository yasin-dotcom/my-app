"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Search" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 border-x-0">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
            RS
          </div>
          <span className="text-xl font-bold">ReelScanner</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                pathname === link.href
                  ? "text-white font-medium"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
