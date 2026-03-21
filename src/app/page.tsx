"use client";

import { useState } from "react";

interface ReelResult {
  id: number;
  instagram_id: string;
  instagram_url: string;
  creator_handle: string;
  caption: string;
  views: number;
  likes: number;
  comments_count: number;
  duration_seconds: number;
  thumbnail_url: string;
  posted_at: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<ReelResult[]>([]);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");

      setResults(data.reels || []);
      setSearched(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function formatViews(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toString();
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Search Form */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Scan Instagram</span> for Viral Content
        </h1>
        <p className="text-gray-400 mb-6">
          Search by hashtag or keyword, filter by date, and analyze what&apos;s getting views.
        </p>

        <form onSubmit={handleSearch} className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="query" className="block text-sm font-medium mb-2">
                Search Term / Hashtag
              </label>
              <input
                id="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. businesscoach, fitnesstips, realestate"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium mb-2">
                From
              </label>
              <input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium mb-2">
                To
              </label>
              <input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Scanning Instagram..." : "Search"}
          </button>
        </form>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Searching Instagram via Apify... this can take up to 2 minutes.</p>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          No reels found for &quot;{query}&quot;. Try a different search term.
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {results.length} Reels Found
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((reel) => (
              <a
                key={reel.id}
                href={`/reel/${reel.id}`}
                className="glass-card rounded-xl p-5 block transition-all hover:scale-[1.02]"
              >
                {reel.thumbnail_url && (
                  <div className="w-full h-48 rounded-lg mb-4 overflow-hidden bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={reel.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-violet-400">
                    @{reel.creator_handle}
                  </span>
                  {reel.posted_at && (
                    <span className="text-xs text-gray-500">
                      {new Date(reel.posted_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                  {reel.caption || "(no caption)"}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span title="Views">
                    <span className="text-white font-medium">{formatViews(reel.views)}</span> views
                  </span>
                  <span title="Likes">
                    <span className="text-white font-medium">{formatViews(reel.likes)}</span> likes
                  </span>
                  <span title="Comments">
                    <span className="text-white font-medium">{formatViews(reel.comments_count)}</span> comments
                  </span>
                  {reel.duration_seconds > 0 && (
                    <span className="ml-auto text-gray-500">
                      {reel.duration_seconds}s
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
