"use client";

import { useState } from "react";

const BUSINESS_TYPES = [
  "Coach / Consultant",
  "Marketing Agency",
  "Freelancer / Creative",
  "Therapist / Counselor",
  "Real Estate Agent",
  "Financial Advisor",
  "Fitness / Wellness",
  "Legal Services",
  "Other Service Business",
];

export function BetaSignupSection({
  success,
  onSuccess,
}: {
  success: boolean;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      businessType: (form.elements.namedItem("businessType") as HTMLSelectElement).value,
      instagramHandle: (form.elements.namedItem("instagramHandle") as HTMLInputElement).value,
      goals: (form.elements.namedItem("goals") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Something went wrong");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section id="beta-signup" className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-12">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-4">You&apos;re in!</h2>
            <p className="text-gray-400 text-lg">
              Welcome to the ReelIntel beta. We&apos;ll send your first intelligence
              report within 48 hours. Check your email for next steps.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="beta-signup" className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold">
            Join the <span className="gradient-text">free beta</span>
          </h2>
          <p className="mt-4 text-gray-400 text-lg">
            Only 50 spots available. Get weekly intelligence reports tailored to
            your service business.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-3xl p-8 md:p-12 space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="businessType" className="block text-sm font-medium mb-2">
                Business Type
              </label>
              <select
                id="businessType"
                name="businessType"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors appearance-none"
              >
                <option value="" className="bg-[#1a1a1a]">
                  Select your business type
                </option>
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-[#1a1a1a]">
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="instagramHandle" className="block text-sm font-medium mb-2">
                Instagram Handle
              </label>
              <input
                id="instagramHandle"
                name="instagramHandle"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
                placeholder="@yourbusiness"
              />
            </div>
          </div>

          <div>
            <label htmlFor="goals" className="block text-sm font-medium mb-2">
              What&apos;s your #1 content goal? (optional)
            </label>
            <textarea
              id="goals"
              name="goals"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors resize-none"
              placeholder="e.g., Get more discovery call bookings from Instagram"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-pink-500 text-white py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Joining..." : "Get Free Beta Access"}
          </button>

          <p className="text-center text-xs text-gray-500">
            Free during beta. No credit card required. We&apos;ll never spam you.
          </p>
        </form>
      </div>
    </section>
  );
}
