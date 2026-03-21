// Instagram Reels Analysis Engine for Service-Based Businesses

export interface ReelData {
  url: string;
  creatorHandle: string;
  creatorNiche: string;
  caption: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  durationSeconds: number;
}

export interface HookAnalysis {
  style: HookStyle;
  framework: string;
  description: string;
  openingSeconds: number;
  patternInterrupt: boolean;
  textOverlay: boolean;
}

export type HookStyle =
  | "pattern_interrupt"
  | "bold_claim"
  | "question"
  | "storytelling"
  | "listicle"
  | "controversy"
  | "before_after"
  | "behind_scenes"
  | "myth_busting"
  | "social_proof_lead";

export interface ScriptStructure {
  segments: ScriptSegment[];
  emotionalArc: EmotionalArc;
  totalDuration: number;
}

export interface ScriptSegment {
  timeRange: string;
  phase: "hook" | "problem" | "agitation" | "authority" | "value" | "cta" | "proof";
  description: string;
  emotion: string;
  durationSeconds: number;
}

export type EmotionalArc =
  | "curiosity_to_action"
  | "pain_to_relief"
  | "fear_to_confidence"
  | "confusion_to_clarity"
  | "frustration_to_solution";

export interface ConversionTrigger {
  type: string;
  timestamp: string;
  description: string;
  effectiveness: "high" | "medium" | "low";
}

export interface ReelAnalysis {
  hook: HookAnalysis;
  script: ScriptStructure;
  conversionTriggers: ConversionTrigger[];
  metrics: EngagementMetrics;
  serviceInsights: ServiceInsights;
}

export interface EngagementMetrics {
  engagementRate: number;
  saveRate: number;
  commentRate: number;
  shareRate: number;
  leadScore: number;
  performanceTier: "top_1_percent" | "top_5_percent" | "top_10_percent" | "above_average" | "average" | "below_average";
}

export interface ServiceInsights {
  authorityIndicators: string[];
  bookingIntentSignals: string[];
  leadGenScore: number;
  idealFor: string[];
  contentCategory: ServiceContentCategory;
}

export type ServiceContentCategory =
  | "educational"
  | "testimonial"
  | "behind_the_scenes"
  | "case_study"
  | "hot_take"
  | "tutorial"
  | "day_in_the_life"
  | "q_and_a"
  | "myth_busting"
  | "results_showcase";

// Hook style detection patterns
const HOOK_PATTERNS: Record<HookStyle, string[]> = {
  pattern_interrupt: ["stop scrolling", "wait", "hold on", "don't skip", "you need to see this"],
  bold_claim: ["the truth is", "nobody tells you", "the real reason", "unpopular opinion", "hot take"],
  question: ["did you know", "have you ever", "what if", "why do", "how to"],
  storytelling: ["last week", "a client came to me", "i remember when", "true story", "let me tell you"],
  listicle: ["3 signs", "5 ways", "7 mistakes", "top", "number one"],
  controversy: ["i'm tired of", "stop doing this", "this is why", "the problem with"],
  before_after: ["before", "after", "transformation", "results", "went from"],
  behind_scenes: ["behind the scenes", "day in the life", "what it's really like", "a day in"],
  myth_busting: ["myth", "actually", "contrary to", "you've been told", "the truth about"],
  social_proof_lead: ["my client", "just helped", "another win", "case study", "results"],
};

const CTA_TYPES = [
  { pattern: /dm|message|inbox/i, type: "DM-based CTA" },
  { pattern: /link in bio|linkinbio|link below/i, type: "Link in Bio" },
  { pattern: /comment|drop a/i, type: "Comment Trigger" },
  { pattern: /book|schedule|call/i, type: "Booking CTA" },
  { pattern: /follow|subscribe/i, type: "Follow CTA" },
  { pattern: /save this|save for later/i, type: "Save Prompt" },
  { pattern: /share this|send this/i, type: "Share Prompt" },
  { pattern: /free|download|guide|checklist/i, type: "Lead Magnet" },
];

const PERSUASION_TRIGGERS = [
  { pattern: /only \d+|limited|exclusive|spots left/i, trigger: "Scarcity signal" },
  { pattern: /free|no cost|complimentary/i, trigger: "Free value offer" },
  { pattern: /client|helped|result|testimonial/i, trigger: "Social proof (results)" },
  { pattern: /years|certified|expert|specialist/i, trigger: "Authority positioning" },
  { pattern: /struggle|pain|frustrated|tired of/i, trigger: "Problem-aware targeting" },
  { pattern: /today|now|don't wait|before it's too late/i, trigger: "Urgency signal" },
  { pattern: /guarantee|promise|proven/i, trigger: "Risk reversal" },
  { pattern: /step.by.step|exactly how|framework/i, trigger: "Process clarity" },
];

export function detectHookStyle(caption: string): HookAnalysis {
  let detectedStyle: HookStyle = "bold_claim";
  let maxMatches = 0;

  for (const [style, patterns] of Object.entries(HOOK_PATTERNS)) {
    const matches = patterns.filter((p) =>
      caption.toLowerCase().includes(p)
    ).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedStyle = style as HookStyle;
    }
  }

  const styleDescriptions: Record<HookStyle, string> = {
    pattern_interrupt:
      "Opens with a disruptive element that forces viewers to stop scrolling",
    bold_claim:
      "Leads with a provocative or contrarian statement to generate curiosity",
    question:
      "Starts with a question that resonates with the target audience's pain points",
    storytelling:
      "Uses narrative structure to draw viewers into a relatable scenario",
    listicle:
      "Presents numbered tips/signs/mistakes for easy consumption and high saves",
    controversy:
      "Takes a strong stance against conventional wisdom to drive engagement",
    before_after:
      "Showcases transformation to build desire and demonstrate results",
    behind_scenes:
      "Pulls back the curtain to build authenticity and trust",
    myth_busting:
      "Challenges common misconceptions to position as the expert",
    social_proof_lead:
      "Opens with client results or wins to establish credibility immediately",
  };

  const frameworkMap: Record<HookStyle, string> = {
    pattern_interrupt: "Interrupt → Curiosity → Value → CTA",
    bold_claim: "Claim → Evidence → Reframe → CTA",
    question: "Question → Relate → Reveal → CTA",
    storytelling: "Story → Lesson → Application → CTA",
    listicle: "Hook → Point 1 → Point 2 → Point 3 → CTA",
    controversy: "Hot Take → Reasoning → Alternative → CTA",
    before_after: "Before State → Process → After State → CTA",
    behind_scenes: "Peek → Context → Reality → CTA",
    myth_busting: "Myth → Truth → Proof → CTA",
    social_proof_lead: "Result → Method → Offer → CTA",
  };

  return {
    style: detectedStyle,
    framework: frameworkMap[detectedStyle],
    description: styleDescriptions[detectedStyle],
    openingSeconds: 2,
    patternInterrupt: detectedStyle === "pattern_interrupt",
    textOverlay: true,
  };
}

export function detectConversionTriggers(caption: string): ConversionTrigger[] {
  const triggers: ConversionTrigger[] = [];

  for (const { pattern, trigger } of PERSUASION_TRIGGERS) {
    if (pattern.test(caption)) {
      triggers.push({
        type: trigger,
        timestamp: "detected",
        description: `Caption contains ${trigger.toLowerCase()} language`,
        effectiveness: "high",
      });
    }
  }

  for (const { pattern, type } of CTA_TYPES) {
    if (pattern.test(caption)) {
      triggers.push({
        type,
        timestamp: "end",
        description: `Uses ${type} strategy`,
        effectiveness: "high",
      });
    }
  }

  return triggers;
}

export function calculateEngagementMetrics(reel: ReelData): EngagementMetrics {
  const engagementRate =
    reel.views > 0
      ? ((reel.likes + reel.comments + reel.shares + reel.saves) / reel.views) * 100
      : 0;

  const saveRate = reel.views > 0 ? (reel.saves / reel.views) * 100 : 0;
  const commentRate = reel.views > 0 ? (reel.comments / reel.views) * 100 : 0;
  const shareRate = reel.views > 0 ? (reel.shares / reel.views) * 100 : 0;

  // Lead score: weighted metric for service businesses
  // Saves and comments are more valuable than likes for services
  const leadScore = Math.min(
    100,
    Math.round(saveRate * 15 + commentRate * 10 + shareRate * 8 + engagementRate * 2)
  );

  let performanceTier: EngagementMetrics["performanceTier"];
  if (engagementRate > 10) performanceTier = "top_1_percent";
  else if (engagementRate > 7) performanceTier = "top_5_percent";
  else if (engagementRate > 5) performanceTier = "top_10_percent";
  else if (engagementRate > 3) performanceTier = "above_average";
  else if (engagementRate > 1.5) performanceTier = "average";
  else performanceTier = "below_average";

  return {
    engagementRate: Math.round(engagementRate * 100) / 100,
    saveRate: Math.round(saveRate * 100) / 100,
    commentRate: Math.round(commentRate * 100) / 100,
    shareRate: Math.round(shareRate * 100) / 100,
    leadScore,
    performanceTier,
  };
}

export function detectContentCategory(caption: string): ServiceContentCategory {
  const categoryPatterns: Record<ServiceContentCategory, RegExp> = {
    educational: /learn|tip|how to|guide|mistake|avoid/i,
    testimonial: /client said|testimonial|review|feedback/i,
    behind_the_scenes: /behind the scenes|day in|what it's like/i,
    case_study: /case study|helped|result|transformation/i,
    hot_take: /hot take|unpopular|truth is|stop doing/i,
    tutorial: /step by step|tutorial|walkthrough|do this/i,
    day_in_the_life: /day in the life|morning routine|typical day/i,
    q_and_a: /q&a|question|asked me|faq/i,
    myth_busting: /myth|actually|contrary|misconception/i,
    results_showcase: /results|before and after|transformation|revenue/i,
  };

  for (const [category, pattern] of Object.entries(categoryPatterns)) {
    if (pattern.test(caption)) {
      return category as ServiceContentCategory;
    }
  }

  return "educational";
}

export function generateScriptStructure(
  reel: ReelData,
  hook: HookAnalysis
): ScriptStructure {
  const duration = reel.durationSeconds || 30;

  const segments: ScriptSegment[] = [];

  // Dynamic segment generation based on duration
  if (duration <= 15) {
    segments.push(
      { timeRange: "0-2s", phase: "hook", description: "Quick hook with text overlay", emotion: "Curiosity", durationSeconds: 2 },
      { timeRange: "2-10s", phase: "value", description: "Core message delivery", emotion: "Understanding", durationSeconds: 8 },
      { timeRange: "10-15s", phase: "cta", description: "Clear call-to-action", emotion: "Action", durationSeconds: 5 }
    );
  } else if (duration <= 30) {
    segments.push(
      { timeRange: "0-2s", phase: "hook", description: `${hook.style.replace(/_/g, " ")} opening`, emotion: "Curiosity", durationSeconds: 2 },
      { timeRange: "2-8s", phase: "problem", description: "Relatable pain point", emotion: "Recognition", durationSeconds: 6 },
      { timeRange: "8-18s", phase: "value", description: "Solution or insight delivery", emotion: "Understanding", durationSeconds: 10 },
      { timeRange: "18-24s", phase: "authority", description: "Credential or proof drop", emotion: "Trust", durationSeconds: 6 },
      { timeRange: "24-30s", phase: "cta", description: "Call-to-action with trigger", emotion: "Action", durationSeconds: 6 }
    );
  } else {
    segments.push(
      { timeRange: "0-3s", phase: "hook", description: `${hook.style.replace(/_/g, " ")} opening`, emotion: "Curiosity", durationSeconds: 3 },
      { timeRange: "3-12s", phase: "problem", description: "Deep problem exploration", emotion: "Recognition", durationSeconds: 9 },
      { timeRange: "12-18s", phase: "agitation", description: "Escalating stakes and consequences", emotion: "Urgency", durationSeconds: 6 },
      { timeRange: "18-35s", phase: "value", description: "Comprehensive solution breakdown", emotion: "Understanding", durationSeconds: 17 },
      { timeRange: "35-45s", phase: "proof", description: "Results, testimonials, or case study", emotion: "Trust", durationSeconds: 10 },
      { timeRange: `45-${duration}s`, phase: "cta", description: "Strong CTA with urgency", emotion: "Action", durationSeconds: duration - 45 }
    );
  }

  const emotionalArcMap: Record<HookStyle, EmotionalArc> = {
    pattern_interrupt: "curiosity_to_action",
    bold_claim: "curiosity_to_action",
    question: "confusion_to_clarity",
    storytelling: "pain_to_relief",
    listicle: "confusion_to_clarity",
    controversy: "frustration_to_solution",
    before_after: "pain_to_relief",
    behind_scenes: "curiosity_to_action",
    myth_busting: "confusion_to_clarity",
    social_proof_lead: "fear_to_confidence",
  };

  return {
    segments,
    emotionalArc: emotionalArcMap[hook.style],
    totalDuration: duration,
  };
}

export function analyzeReel(reel: ReelData): ReelAnalysis {
  const hook = detectHookStyle(reel.caption);
  const script = generateScriptStructure(reel, hook);
  const conversionTriggers = detectConversionTriggers(reel.caption);
  const metrics = calculateEngagementMetrics(reel);
  const contentCategory = detectContentCategory(reel.caption);

  const authorityIndicators: string[] = [];
  if (/years|decade/i.test(reel.caption)) authorityIndicators.push("Experience mention");
  if (/certified|licensed|accredited/i.test(reel.caption)) authorityIndicators.push("Credentials");
  if (/client|helped|served/i.test(reel.caption)) authorityIndicators.push("Client references");
  if (/featured|as seen|media/i.test(reel.caption)) authorityIndicators.push("Media mentions");
  if (/award|recognized/i.test(reel.caption)) authorityIndicators.push("Awards/Recognition");

  const bookingIntentSignals: string[] = [];
  if (/book|schedule|calendar/i.test(reel.caption)) bookingIntentSignals.push("Direct booking language");
  if (/dm|message|reach out/i.test(reel.caption)) bookingIntentSignals.push("DM invitation");
  if (/free.*call|consult|audit/i.test(reel.caption)) bookingIntentSignals.push("Free consultation offer");
  if (/limited|spots|availability/i.test(reel.caption)) bookingIntentSignals.push("Scarcity-driven urgency");
  if (/link in bio/i.test(reel.caption)) bookingIntentSignals.push("Bio link funnel");

  const nicheMap: Record<string, string[]> = {
    coach: ["Coaches", "Consultants", "Mentors"],
    consultant: ["Consultants", "Agencies", "B2B Service Providers"],
    therapist: ["Therapists", "Counselors", "Mental Health Professionals"],
    agency: ["Agencies", "Marketing Firms", "Creative Studios"],
    freelancer: ["Freelancers", "Creatives", "Solo Service Providers"],
    fitness: ["Fitness Coaches", "Personal Trainers", "Wellness Practitioners"],
    real_estate: ["Real Estate Agents", "Property Managers"],
    finance: ["Financial Advisors", "Accountants", "Tax Professionals"],
  };

  const niche = reel.creatorNiche?.toLowerCase() || "";
  const idealFor = Object.entries(nicheMap).find(([key]) => niche.includes(key))?.[1] || ["Service-Based Businesses"];

  return {
    hook,
    script,
    conversionTriggers,
    metrics,
    serviceInsights: {
      authorityIndicators,
      bookingIntentSignals,
      leadGenScore: metrics.leadScore,
      idealFor,
      contentCategory,
    },
  };
}

export function generateWeeklyReport(
  analyses: ReelAnalysis[],
  userNiche: string
) {
  const topPerformers = [...analyses]
    .sort((a, b) => b.metrics.leadScore - a.metrics.leadScore)
    .slice(0, 10);

  const hookDistribution = analyses.reduce(
    (acc, a) => {
      acc[a.hook.style] = (acc[a.hook.style] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topHooks = Object.entries(hookDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([style, count]) => ({ style, count, percentage: Math.round((count / analyses.length) * 100) }));

  const avgEngagement = analyses.reduce((sum, a) => sum + a.metrics.engagementRate, 0) / analyses.length;
  const avgLeadScore = analyses.reduce((sum, a) => sum + a.metrics.leadScore, 0) / analyses.length;

  const allTriggers = analyses.flatMap((a) => a.conversionTriggers.map((t) => t.type));
  const triggerCounts = allTriggers.reduce(
    (acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const topTriggers = Object.entries(triggerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const categoryDistribution = analyses.reduce(
    (acc, a) => {
      const cat = a.serviceInsights.contentCategory;
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Generate content suggestions
  const suggestions = topPerformers.slice(0, 5).map((analysis, i) => ({
    priority: i + 1,
    hookStyle: analysis.hook.style,
    framework: analysis.hook.framework,
    contentCategory: analysis.serviceInsights.contentCategory,
    emotionalArc: analysis.script.emotionalArc,
    suggestedCTA:
      analysis.conversionTriggers.find((t) => t.type.includes("CTA"))?.type || "DM-based CTA",
    estimatedEngagement: analysis.metrics.performanceTier,
  }));

  return {
    reportDate: new Date().toISOString().split("T")[0],
    niche: userNiche,
    summary: {
      totalReelsAnalyzed: analyses.length,
      averageEngagementRate: Math.round(avgEngagement * 100) / 100,
      averageLeadScore: Math.round(avgLeadScore),
      topPerformingCount: topPerformers.length,
    },
    topHookStyles: topHooks,
    topConversionTriggers: topTriggers,
    contentCategoryBreakdown: categoryDistribution,
    topPerformers: topPerformers.map((a) => ({
      hookStyle: a.hook.style,
      framework: a.hook.framework,
      engagementRate: a.metrics.engagementRate,
      leadScore: a.metrics.leadScore,
      performanceTier: a.metrics.performanceTier,
      contentCategory: a.serviceInsights.contentCategory,
    })),
    contentSuggestions: suggestions,
    weeklyInsight: generateWeeklyInsight(topHooks, topTriggers, userNiche),
  };
}

function generateWeeklyInsight(
  topHooks: { style: string; percentage: number }[],
  topTriggers: [string, number][],
  niche: string
): string {
  const topHook = topHooks[0];
  const topTrigger = topTriggers[0];

  return `This week in the ${niche} space, ${topHook?.style.replace(/_/g, " ")} hooks dominated with ${topHook?.percentage}% of top-performing Reels using this format. The most effective conversion strategy was "${topTrigger?.[0]}" — consider incorporating this into your next 3 Reels. Focus on content that builds authority while driving DM conversations for maximum lead generation.`;
}
