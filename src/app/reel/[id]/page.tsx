"use client";

import { useState, useEffect, use } from "react";
import {
  detectHookStyle,
  detectConversionTriggers,
  calculateEngagementMetrics,
  detectContentCategory,
} from "@/lib/analyzer";

interface ReelData {
  id: number;
  instagram_url: string;
  creator_handle: string;
  caption: string;
  views: number;
  likes: number;
  comments_count: number;
  shares: number;
  saves: number;
  duration_seconds: number;
  thumbnail_url: string;
  video_url: string;
  posted_at: string;
}

interface TranscriptData {
  text: string;
}

interface FrameDesc {
  frameNumber: number;
  description: string;
}

interface VisualData {
  frame_descriptions: string;
  overall_analysis: string;
  hook_analysis: string;
  content_style: string;
}

export default function ReelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [reel, setReel] = useState<ReelData | null>(null);
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [visual, setVisual] = useState<VisualData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "transcript" | "visual">("overview");

  useEffect(() => {
    fetchReel();
  }, [id]);

  async function fetchReel() {
    try {
      const res = await fetch(`/api/reels/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReel(data.reel);
      setTranscript(data.transcript);
      setVisual(data.visualAnalysis);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    setAnalyzeError("");

    try {
      const res = await fetch(`/api/reels/${id}/analyze`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refresh data
      await fetchReel();
      setActiveTab("transcript");
    } catch (err) {
      setAnalyzeError((err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-block w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!reel) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center text-gray-400">
        Reel not found.
      </div>
    );
  }

  // Run caption-based analysis
  const hookAnalysis = detectHookStyle(reel.caption || "");
  const triggers = detectConversionTriggers(reel.caption || "");
  const metrics = calculateEngagementMetrics({
    url: reel.instagram_url || "",
    creatorHandle: reel.creator_handle || "",
    creatorNiche: "",
    caption: reel.caption || "",
    views: reel.views,
    likes: reel.likes,
    comments: reel.comments_count,
    shares: reel.shares || 0,
    saves: reel.saves || 0,
    durationSeconds: reel.duration_seconds || 0,
  });
  const category = detectContentCategory(reel.caption || "");

  let parsedFrames: FrameDesc[] = [];
  if (visual?.frame_descriptions) {
    try {
      parsedFrames = JSON.parse(visual.frame_descriptions);
    } catch {
      // ignore
    }
  }

  const hasDeepAnalysis = transcript || visual;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back link */}
      <a href="/" className="text-sm text-gray-400 hover:text-white mb-6 inline-block">
        &larr; Back to search
      </a>

      {/* Reel header */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {reel.thumbnail_url && (
            <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-white/5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={reel.thumbnail_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-medium text-violet-400">
                @{reel.creator_handle}
              </span>
              {reel.posted_at && (
                <span className="text-sm text-gray-500">
                  {new Date(reel.posted_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <p className="text-gray-300 text-sm mb-4">{reel.caption || "(no caption)"}</p>

            {/* Metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <MetricBox label="Views" value={formatNum(reel.views)} />
              <MetricBox label="Likes" value={formatNum(reel.likes)} />
              <MetricBox label="Comments" value={formatNum(reel.comments_count)} />
              <MetricBox label="Engagement" value={`${metrics.engagementRate}%`} />
              <MetricBox label="Lead Score" value={`${metrics.leadScore}/100`} highlight />
            </div>
          </div>
        </div>

        {/* Analyze button */}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {analyzing
              ? "Analyzing... (this takes ~60s)"
              : hasDeepAnalysis
                ? "Re-analyze"
                : "Deep Analyze (Transcript + Visual)"}
          </button>
          {reel.instagram_url && (
            <a
              href={reel.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white"
            >
              View on Instagram &rarr;
            </a>
          )}
        </div>
        {analyzeError && (
          <div className="mt-3 text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl">
            {analyzeError}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
        {(["overview", "transcript", "visual"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-violet-500/20 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab === "overview" ? "Caption Analysis" : tab === "transcript" ? "Transcript" : "Visual Analysis"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Hook */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">
              Hook Style
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-violet-500/20 text-violet-300">
                {hookAnalysis.style.replace(/_/g, " ")}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-pink-500/20 text-pink-300">
                {category.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-2">{hookAnalysis.description}</p>
            <p className="text-xs text-gray-500">
              Framework: {hookAnalysis.framework}
            </p>
          </div>

          {/* Performance tier */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">
              Performance
            </h3>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(metrics.performanceTier)}`}>
                {metrics.performanceTier.replace(/_/g, " ")}
              </span>
              <span className="text-sm text-gray-400">
                Save rate: {metrics.saveRate}% | Comment rate: {metrics.commentRate}%
              </span>
            </div>
          </div>

          {/* Conversion triggers */}
          {triggers.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">
                Conversion Triggers Found
              </h3>
              <div className="flex flex-wrap gap-2">
                {triggers.map((t, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-sm bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20 text-gray-300"
                  >
                    {t.type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "transcript" && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">
            Transcript
          </h3>
          {transcript ? (
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {transcript.text}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No transcript yet. Click &quot;Deep Analyze&quot; above to extract the transcript from the video.
              <br />
              <span className="text-xs text-gray-600 mt-1 block">
                Requires: OpenAI API key (for Whisper transcription) + yt-dlp + ffmpeg installed.
              </span>
            </p>
          )}
        </div>
      )}

      {activeTab === "visual" && (
        <div className="space-y-6">
          {visual ? (
            <>
              {/* Hook Analysis */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">
                  Visual Hook Analysis
                </h3>
                <p className="text-sm text-gray-300">{visual.hook_analysis}</p>
              </div>

              {/* Content Style */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">
                  Content Style
                </h3>
                <p className="text-sm text-gray-300">{visual.content_style}</p>
              </div>

              {/* Overall Analysis */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">
                  Overall Visual Strategy
                </h3>
                <p className="text-sm text-gray-300">{visual.overall_analysis}</p>
              </div>

              {/* Frame by frame */}
              {parsedFrames.length > 0 && (
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">
                    Frame-by-Frame Breakdown
                  </h3>
                  <div className="space-y-3">
                    {parsedFrames.map((frame) => (
                      <div key={frame.frameNumber} className="bg-white/5 rounded-lg p-3 flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 text-xs font-bold shrink-0">
                          {frame.frameNumber}
                        </div>
                        <p className="text-sm text-gray-300">{frame.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card rounded-xl p-6">
              <p className="text-gray-500 text-sm">
                No visual analysis yet. Click &quot;Deep Analyze&quot; above to extract frames and analyze them with AI.
                <br />
                <span className="text-xs text-gray-600 mt-1 block">
                  Requires: Anthropic API key + yt-dlp + ffmpeg installed.
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-3 text-center ${
        highlight ? "bg-violet-500/10 border border-violet-500/20" : "bg-white/5"
      }`}
    >
      <div className={`text-lg font-bold ${highlight ? "text-violet-400" : ""}`}>
        {value}
      </div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function getTierColor(tier: string): string {
  const map: Record<string, string> = {
    top_1_percent: "text-yellow-400 bg-yellow-500/10",
    top_5_percent: "text-green-400 bg-green-500/10",
    top_10_percent: "text-blue-400 bg-blue-500/10",
    above_average: "text-violet-400 bg-violet-500/10",
    average: "text-gray-400 bg-gray-500/10",
    below_average: "text-red-400 bg-red-500/10",
  };
  return map[tier] || map.average;
}
