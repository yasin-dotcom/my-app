"use client";

import { useState, useEffect, useCallback } from "react";

interface Report {
  id: number;
  report_date: string;
  status: string;
  created_at: string;
}

interface ReportData {
  reportDate: string;
  niche: string;
  summary: {
    totalReelsAnalyzed: number;
    averageEngagementRate: number;
    averageLeadScore: number;
    topPerformingCount: number;
  };
  topHookStyles: { style: string; count: number; percentage: number }[];
  topConversionTriggers: [string, number][];
  contentCategoryBreakdown: Record<string, number>;
  topPerformers: {
    hookStyle: string;
    framework: string;
    engagementRate: number;
    leadScore: number;
    performanceTier: string;
    contentCategory: string;
  }[];
  contentSuggestions: {
    priority: number;
    hookStyle: string;
    framework: string;
    contentCategory: string;
    emotionalArc: string;
    suggestedCTA: string;
  }[];
  weeklyInsight: string;
}

export function ReportsView({ email }: { email: string }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  async function generateReport() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate report");
      }

      const data = await res.json();
      setActiveReport(data.report);
      fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  }

  async function viewReport(id: number) {
    try {
      const res = await fetch(`/api/reports?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveReport(data.report);
      }
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold">Weekly Reports</h2>
        <button
          onClick={generateReport}
          disabled={generating}
          className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-6 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate New Report"}
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Report List */}
      {reports.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Past Reports</h3>
          <div className="space-y-2">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => viewReport(report.id)}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-colors text-left"
              >
                <div>
                  <div className="font-medium">Report — {report.report_date}</div>
                  <div className="text-xs text-gray-400">{report.created_at}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400">
                  {report.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {reports.length === 0 && !activeReport && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
          <p className="text-gray-400 mb-6">
            Analyze some Reels first, then generate your weekly intelligence report.
          </p>
        </div>
      )}

      {/* Active Report */}
      {activeReport && <ReportDetail report={activeReport} />}
    </div>
  );
}

function ReportDetail({ report }: { report: ReportData }) {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h3 className="text-2xl font-bold">Weekly Intelligence Report</h3>
            <p className="text-gray-400 mt-1">
              {report.reportDate} &middot; {report.niche}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{report.summary.totalReelsAnalyzed}</div>
            <div className="text-xs text-gray-400 mt-1">Reels Analyzed</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{report.summary.averageEngagementRate}%</div>
            <div className="text-xs text-gray-400 mt-1">Avg Engagement</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{report.summary.averageLeadScore}</div>
            <div className="text-xs text-gray-400 mt-1">Avg Lead Score</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{report.summary.topPerformingCount}</div>
            <div className="text-xs text-gray-400 mt-1">Top Performers</div>
          </div>
        </div>

        {/* Weekly Insight */}
        <div className="bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20 rounded-xl p-5 mb-8">
          <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-2">
            Key Insight
          </h4>
          <p className="text-gray-300">{report.weeklyInsight}</p>
        </div>
      </div>

      {/* Top Hook Styles */}
      {report.topHookStyles.length > 0 && (
        <div className="glass-card rounded-2xl p-8">
          <h4 className="text-lg font-semibold mb-4">Top Hook Styles This Week</h4>
          <div className="space-y-3">
            {report.topHookStyles.map((hook) => (
              <div key={hook.style} className="flex items-center gap-4">
                <div className="text-sm text-gray-300 w-40">
                  {hook.style.replace(/_/g, " ")}
                </div>
                <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
                    style={{ width: `${hook.percentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-400 w-12 text-right">
                  {hook.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Suggestions */}
      {report.contentSuggestions.length > 0 && (
        <div className="glass-card rounded-2xl p-8">
          <h4 className="text-lg font-semibold mb-4">Content Ideas for You</h4>
          <div className="space-y-4">
            {report.contentSuggestions.map((suggestion) => (
              <div key={suggestion.priority} className="bg-white/5 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">
                    {suggestion.priority}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-violet-500/20 text-violet-300">
                    {suggestion.hookStyle.replace(/_/g, " ")}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-pink-500/20 text-pink-300">
                    {suggestion.contentCategory.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="text-sm text-gray-300 space-y-1">
                  <p><strong>Framework:</strong> {suggestion.framework}</p>
                  <p><strong>Emotional Arc:</strong> {suggestion.emotionalArc.replace(/_/g, " ")}</p>
                  <p><strong>Suggested CTA:</strong> {suggestion.suggestedCTA}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
