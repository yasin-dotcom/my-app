"use client";

import { useState } from "react";

interface AnalysisResult {
  hook: {
    style: string;
    framework: string;
    description: string;
  };
  script: {
    segments: {
      timeRange: string;
      phase: string;
      description: string;
      emotion: string;
    }[];
    emotionalArc: string;
  };
  conversionTriggers: {
    type: string;
    description: string;
    effectiveness: string;
  }[];
  metrics: {
    engagementRate: number;
    saveRate: number;
    commentRate: number;
    shareRate: number;
    leadScore: number;
    performanceTier: string;
  };
  serviceInsights: {
    authorityIndicators: string[];
    bookingIntentSignals: string[];
    contentCategory: string;
    idealFor: string[];
  };
}

export function AnalyzerTool() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const form = e.currentTarget;
    const data = {
      url: (form.elements.namedItem("url") as HTMLInputElement).value,
      creatorHandle: (form.elements.namedItem("creatorHandle") as HTMLInputElement).value,
      creatorNiche: (form.elements.namedItem("creatorNiche") as HTMLInputElement).value,
      caption: (form.elements.namedItem("caption") as HTMLTextAreaElement).value,
      views: parseInt((form.elements.namedItem("views") as HTMLInputElement).value) || 0,
      likes: parseInt((form.elements.namedItem("likes") as HTMLInputElement).value) || 0,
      comments: parseInt((form.elements.namedItem("comments") as HTMLInputElement).value) || 0,
      shares: parseInt((form.elements.namedItem("shares") as HTMLInputElement).value) || 0,
      saves: parseInt((form.elements.namedItem("saves") as HTMLInputElement).value) || 0,
      durationSeconds: parseInt((form.elements.namedItem("duration") as HTMLInputElement).value) || 30,
    };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Analysis failed");
      const json = await res.json();
      setResult(json.analysis);
    } catch {
      setError("Failed to analyze reel. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-xl font-semibold mb-6">Analyze a Reel</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <InputField name="creatorHandle" label="Creator Handle" placeholder="@creator" required />
            <InputField name="creatorNiche" label="Creator Niche" placeholder="e.g., Business Coach" />
          </div>

          <InputField name="url" label="Reel URL (optional)" placeholder="https://instagram.com/reel/..." />

          <div>
            <label htmlFor="caption" className="block text-sm font-medium mb-2">Caption / Script</label>
            <textarea
              id="caption"
              name="caption"
              rows={4}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
              placeholder="Paste the reel caption or script here..."
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <InputField name="views" label="Views" type="number" placeholder="0" />
            <InputField name="likes" label="Likes" type="number" placeholder="0" />
            <InputField name="comments" label="Comments" type="number" placeholder="0" />
            <InputField name="shares" label="Shares" type="number" placeholder="0" />
            <InputField name="saves" label="Saves" type="number" placeholder="0" />
            <InputField name="duration" label="Duration (s)" type="number" placeholder="30" />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Reel"}
          </button>
        </form>
      </div>

      {/* Results */}
      {result && <AnalysisResults result={result} />}
    </div>
  );
}

function InputField({
  name,
  label,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-2">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
      />
    </div>
  );
}

function AnalysisResults({ result }: { result: AnalysisResult }) {
  const tierColors: Record<string, string> = {
    top_1_percent: "text-yellow-400 bg-yellow-500/10",
    top_5_percent: "text-green-400 bg-green-500/10",
    top_10_percent: "text-blue-400 bg-blue-500/10",
    above_average: "text-violet-400 bg-violet-500/10",
    average: "text-gray-400 bg-gray-500/10",
    below_average: "text-red-400 bg-red-500/10",
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h3 className="text-xl font-semibold">Analysis Results</h3>
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              tierColors[result.metrics.performanceTier] || tierColors.average
            }`}
          >
            {result.metrics.performanceTier.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard label="Engagement Rate" value={`${result.metrics.engagementRate}%`} />
          <MetricCard label="Save Rate" value={`${result.metrics.saveRate}%`} />
          <MetricCard label="Comment Rate" value={`${result.metrics.commentRate}%`} />
          <MetricCard label="Share Rate" value={`${result.metrics.shareRate}%`} />
          <MetricCard label="Lead Score" value={`${result.metrics.leadScore}/100`} highlight />
        </div>
      </div>

      {/* Hook Analysis */}
      <div className="glass-card rounded-2xl p-8">
        <h3 className="text-lg font-semibold text-violet-400 uppercase tracking-wider mb-4">
          Hook Analysis
        </h3>
        <div className="bg-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-violet-500/20 text-violet-300">
              {result.hook.style.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-gray-300 mb-3">{result.hook.description}</p>
          <div className="text-sm text-gray-400">
            <strong className="text-gray-300">Framework:</strong> {result.hook.framework}
          </div>
        </div>
      </div>

      {/* Script Structure */}
      <div className="glass-card rounded-2xl p-8">
        <h3 className="text-lg font-semibold text-violet-400 uppercase tracking-wider mb-4">
          Script Structure
        </h3>
        <div className="mb-3 text-sm text-gray-400">
          Emotional arc: <span className="text-gray-300">{result.script.emotionalArc.replace(/_/g, " ")}</span>
        </div>
        <div className="space-y-2">
          {result.script.segments.map((seg) => (
            <div key={seg.timeRange} className="flex items-center gap-4 bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-500 w-12 shrink-0 font-mono">{seg.timeRange}</div>
              <div className="px-2 py-0.5 rounded text-xs font-medium bg-violet-500/20 text-violet-300 w-20 text-center shrink-0">
                {seg.phase}
              </div>
              <div className="text-sm text-gray-300 flex-1">{seg.description}</div>
              <div className="text-xs text-gray-500 shrink-0">{seg.emotion}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Triggers */}
      {result.conversionTriggers.length > 0 && (
        <div className="glass-card rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-violet-400 uppercase tracking-wider mb-4">
            Conversion Triggers
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.conversionTriggers.map((trigger, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-sm bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20 text-gray-300"
              >
                {trigger.type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Service Insights */}
      <div className="glass-card rounded-2xl p-8">
        <h3 className="text-lg font-semibold text-violet-400 uppercase tracking-wider mb-4">
          Service Business Insights
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium mb-2">Content Category</div>
            <span className="px-3 py-1 rounded-full text-sm bg-violet-500/20 text-violet-300">
              {result.serviceInsights.contentCategory.replace(/_/g, " ")}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Ideal For</div>
            <div className="flex flex-wrap gap-1">
              {result.serviceInsights.idealFor.map((niche) => (
                <span key={niche} className="px-2 py-0.5 rounded text-xs bg-pink-500/20 text-pink-300">
                  {niche}
                </span>
              ))}
            </div>
          </div>
          {result.serviceInsights.authorityIndicators.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Authority Indicators</div>
              <ul className="text-sm text-gray-400 space-y-1">
                {result.serviceInsights.authorityIndicators.map((ind) => (
                  <li key={ind}>- {ind}</li>
                ))}
              </ul>
            </div>
          )}
          {result.serviceInsights.bookingIntentSignals.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Booking Intent Signals</div>
              <ul className="text-sm text-gray-400 space-y-1">
                {result.serviceInsights.bookingIntentSignals.map((sig) => (
                  <li key={sig}>- {sig}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 text-center ${highlight ? "bg-violet-500/10 border border-violet-500/20" : "bg-white/5"}`}>
      <div className={`text-2xl font-bold ${highlight ? "text-violet-400" : ""}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
