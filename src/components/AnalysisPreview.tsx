export function AnalysisPreview() {
  return (
    <section id="preview" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            Sample <span className="gradient-text">Analysis Report</span>
          </h2>
          <p className="mt-4 text-gray-400 text-lg">
            Here&apos;s what a typical Reel breakdown looks like inside ReelIntel.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 md:p-12 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-sm text-violet-400 font-medium mb-1">
                REEL ANALYSIS
              </div>
              <h3 className="text-2xl font-bold">
                &quot;3 Signs You Need a Brand Strategist&quot;
              </h3>
              <p className="text-gray-400 mt-1">@brandstrategy.pro &middot; Brand Consultant</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              High Performer
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Views", value: "847K" },
              { label: "Engagement Rate", value: "8.2%" },
              { label: "Save Rate", value: "4.1%" },
              { label: "Lead Score", value: "92/100" },
            ].map((m) => (
              <div key={m.label} className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{m.value}</div>
                <div className="text-xs text-gray-400 mt-1">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Hook Analysis */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">
              Hook Framework
            </h4>
            <div className="bg-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-violet-500/20 text-violet-300">
                  Pattern Interrupt
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-pink-500/20 text-pink-300">
                  Listicle
                </span>
              </div>
              <p className="text-gray-300">
                Opens with a direct-to-camera statement that challenges viewer assumptions.
                Uses &quot;3 Signs&quot; framework to create curiosity loops. First 1.5 seconds
                feature a visual pattern interrupt (text overlay + hand gesture).
              </p>
            </div>
          </div>

          {/* Script Structure */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">
              Script Structure &amp; Emotional Arc
            </h4>
            <div className="space-y-3">
              {[
                {
                  time: "0-2s",
                  phase: "Hook",
                  desc: "Pattern interrupt + bold claim",
                  emotion: "Curiosity",
                },
                {
                  time: "2-8s",
                  phase: "Problem",
                  desc: "Sign #1 — relatable pain point",
                  emotion: "Recognition",
                },
                {
                  time: "8-15s",
                  phase: "Agitation",
                  desc: "Signs #2 & #3 — escalating stakes",
                  emotion: "Urgency",
                },
                {
                  time: "15-22s",
                  phase: "Authority",
                  desc: "Quick credential drop + results mention",
                  emotion: "Trust",
                },
                {
                  time: "22-28s",
                  phase: "CTA",
                  desc: "\"DM me BRAND for a free audit\"",
                  emotion: "Action",
                },
              ].map((s) => (
                <div
                  key={s.time}
                  className="flex items-center gap-4 bg-white/5 rounded-lg p-3"
                >
                  <div className="text-xs text-gray-500 w-12 shrink-0 font-mono">
                    {s.time}
                  </div>
                  <div className="px-2 py-0.5 rounded text-xs font-medium bg-violet-500/20 text-violet-300 w-20 text-center shrink-0">
                    {s.phase}
                  </div>
                  <div className="text-sm text-gray-300 flex-1">{s.desc}</div>
                  <div className="text-xs text-gray-500 shrink-0">
                    {s.emotion}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Triggers */}
          <div>
            <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">
              Conversion Triggers Detected
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                "DM-based CTA",
                "Free value offer",
                "Scarcity signal",
                "Social proof (results)",
                "Authority positioning",
                "Problem-aware targeting",
                "Keyword trigger (BRAND)",
              ].map((trigger) => (
                <span
                  key={trigger}
                  className="px-3 py-1.5 rounded-full text-sm bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20 text-gray-300"
                >
                  {trigger}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
