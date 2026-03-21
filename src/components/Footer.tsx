export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center font-bold text-white text-xs">
            RI
          </div>
          <span className="font-semibold">ReelIntel</span>
        </div>

        <p className="text-sm text-gray-500">
          AI-powered Instagram Reels intelligence for service businesses.
        </p>

        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} ReelIntel. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
