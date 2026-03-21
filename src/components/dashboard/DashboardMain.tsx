"use client";

import { useState } from "react";
import { AnalyzerTool } from "./AnalyzerTool";
import { ReportsView } from "./ReportsView";

export function DashboardMain({ email }: { email: string }) {
  const [activeTab, setActiveTab] = useState<"overview" | "analyze" | "reports">("overview");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Intelligence Dashboard</h1>
          <p className="text-gray-400 mt-1">{email}</p>
        </div>
        <div className="flex gap-2">
          {(["overview", "analyze", "reports"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-violet-500 text-white"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && <OverviewTab email={email} />}
      {activeTab === "analyze" && <AnalyzerTool />}
      {activeTab === "reports" && <ReportsView email={email} />}
    </div>
  );
}

function OverviewTab({ email }: { email: string }) {
  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Reels Analyzed", value: "—", change: "This week" },
          { label: "Avg Lead Score", value: "—", change: "Across all reels" },
          { label: "Top Hook Style", value: "—", change: "Most effective" },
          { label: "Reports Generated", value: "—", change: "Total" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Getting Started */}
      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="space-y-4">
          <Step
            number={1}
            title="Analyze your first Reel"
            description="Go to the Analyze tab and paste a Reel's details to see our AI breakdown in action."
          />
          <Step
            number={2}
            title="Analyze competitor content"
            description="Run analysis on 5-10 top-performing Reels in your niche to build your intelligence base."
          />
          <Step
            number={3}
            title="Generate your first report"
            description="Once you have enough data, head to Reports to generate your weekly intelligence report."
          />
        </div>
      </div>

      {/* Content Calendar Preview */}
      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-xl font-semibold mb-4">
          Suggested Content Calendar
        </h2>
        <p className="text-gray-400 mb-6">
          Based on trending formats in your niche. Analyze more Reels to
          personalize these suggestions.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              day: "Monday",
              type: "Educational",
              hook: "Listicle",
              idea: "\"3 mistakes [your niche] clients make before hiring a professional\"",
            },
            {
              day: "Wednesday",
              type: "Authority",
              hook: "Bold Claim",
              idea: "\"The truth about [common misconception] that nobody talks about\"",
            },
            {
              day: "Friday",
              type: "Social Proof",
              hook: "Story",
              idea: "\"A client came to me with [problem]. Here's what happened...\"",
            },
          ].map((item) => (
            <div key={item.day} className="bg-white/5 rounded-xl p-5">
              <div className="text-violet-400 text-sm font-medium mb-2">
                {item.day}
              </div>
              <div className="flex gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs bg-violet-500/20 text-violet-300">
                  {item.type}
                </span>
                <span className="px-2 py-0.5 rounded text-xs bg-pink-500/20 text-pink-300">
                  {item.hook}
                </span>
              </div>
              <p className="text-sm text-gray-300">{item.idea}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Niche Trends */}
      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-xl font-semibold mb-4">
          Trending in Service Business Reels
        </h2>
        <div className="space-y-3">
          {[
            {
              trend: "DM-based CTAs are outperforming link-in-bio by 3.2x",
              category: "CTA Strategy",
            },
            {
              trend: "Reels under 15 seconds are getting 40% more saves",
              category: "Format",
            },
            {
              trend: "\"Hot take\" hooks drive 2x more comments than questions",
              category: "Hook Style",
            },
            {
              trend: "Showing client results in first 2 seconds boosts completion rate",
              category: "Content",
            },
            {
              trend: "Posting between 7-9 AM on weekdays maximizes reach for B2B services",
              category: "Timing",
            },
          ].map((item) => (
            <div
              key={item.trend}
              className="flex items-start gap-3 bg-white/5 rounded-lg p-4"
            >
              <span className="px-2 py-0.5 rounded text-xs bg-violet-500/20 text-violet-300 shrink-0 mt-0.5">
                {item.category}
              </span>
              <span className="text-sm text-gray-300">{item.trend}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-sm font-bold shrink-0">
        {number}
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
    </div>
  );
}
