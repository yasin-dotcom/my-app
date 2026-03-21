"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 border-x-0">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
            RI
          </div>
          <span className="text-xl font-bold">ReelIntel</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#preview" className="hover:text-white transition-colors">Preview</a>
          <a href="#beta-signup" className="hover:text-white transition-colors">
            <span className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
              Join Beta
            </span>
          </a>
        </nav>

        <a
          href="#beta-signup"
          className="md:hidden bg-gradient-to-r from-violet-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium"
        >
          Join Beta
        </a>
      </div>
    </header>
  );
}
