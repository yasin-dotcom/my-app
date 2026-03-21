"use client";

import { useState } from "react";

export function DashboardLogin({
  onLogin,
}: {
  onLogin: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/reports?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Account not found");
      }
      onLogin(email);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not find your account"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-3">Welcome back</h1>
        <p className="text-gray-400">
          Enter your email to access your intelligence dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="jane@example.com"
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
          className="w-full bg-gradient-to-r from-violet-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Checking..." : "Access Dashboard"}
        </button>
      </form>
    </div>
  );
}
