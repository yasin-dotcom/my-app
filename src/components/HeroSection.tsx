"use client";

export function HeroSection({ onCtaClick }: { onCtaClick: () => void }) {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-gray-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Now accepting 50 beta testers
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in-delay-1">
          Your AI watches{" "}
          <span className="gradient-text">Instagram Reels</span>
          <br />
          so you don&apos;t have to
        </h1>

        <p className="mt-8 text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay-2">
          We analyze thousands of top-performing Reels every week to find exactly
          what works for <strong className="text-white">service-based businesses</strong> like yours.
          Get hook frameworks, script templates, and conversion triggers
          tailored to your niche.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-3">
          <button
            onClick={onCtaClick}
            className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity animate-pulse-glow"
          >
            Get Free Beta Access
          </button>
          <a
            href="#preview"
            className="glass-card px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-colors text-center"
          >
            See Sample Report
          </a>
        </div>

        <p className="mt-6 text-sm text-gray-500 animate-fade-in-delay-3">
          Free for beta testers. No credit card required.
        </p>
      </div>
    </section>
  );
}
