import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { analyzeReel, type ReelData } from "@/lib/analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      url,
      creatorHandle,
      creatorNiche,
      caption,
      views,
      likes,
      comments,
      shares,
      saves,
      durationSeconds,
    } = body as ReelData;

    if (!creatorHandle || !caption) {
      return NextResponse.json(
        { error: "Creator handle and caption are required." },
        { status: 400 }
      );
    }

    const reelData: ReelData = {
      url: url || "",
      creatorHandle,
      creatorNiche: creatorNiche || "general",
      caption,
      views: views || 0,
      likes: likes || 0,
      comments: comments || 0,
      shares: shares || 0,
      saves: saves || 0,
      durationSeconds: durationSeconds || 30,
    };

    // Analyze the reel
    const analysis = analyzeReel(reelData);

    // Store in database
    const db = getDb();

    const reelResult = db
      .prepare(
        `INSERT OR IGNORE INTO reels (instagram_url, creator_handle, creator_niche, caption, views, likes, comments, shares, saves, duration_seconds)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        reelData.url,
        reelData.creatorHandle,
        reelData.creatorNiche,
        reelData.caption,
        reelData.views,
        reelData.likes,
        reelData.comments,
        reelData.shares,
        reelData.saves,
        reelData.durationSeconds
      );

    const reelId =
      reelResult.lastInsertRowid ||
      (
        db
          .prepare("SELECT id FROM reels WHERE instagram_url = ?")
          .get(reelData.url) as { id: number }
      )?.id;

    if (reelId) {
      db.prepare(
        `INSERT INTO reel_analyses (reel_id, hook_style, hook_framework, script_template, emotional_arc, conversion_triggers, persuasion_techniques, cta_type, engagement_rate, save_rate, lead_score, authority_indicators, booking_intent_signals, content_category, target_audience, key_takeaways)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        reelId,
        analysis.hook.style,
        analysis.hook.framework,
        JSON.stringify(analysis.script.segments),
        analysis.script.emotionalArc,
        JSON.stringify(analysis.conversionTriggers),
        JSON.stringify(analysis.conversionTriggers.filter((t) => t.effectiveness === "high")),
        analysis.conversionTriggers.find((t) => t.type.includes("CTA"))?.type || "none",
        analysis.metrics.engagementRate,
        analysis.metrics.saveRate,
        analysis.metrics.leadScore,
        JSON.stringify(analysis.serviceInsights.authorityIndicators),
        JSON.stringify(analysis.serviceInsights.bookingIntentSignals),
        analysis.serviceInsights.contentCategory,
        JSON.stringify(analysis.serviceInsights.idealFor),
        JSON.stringify([])
      );
    }

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze reel." },
      { status: 500 }
    );
  }
}
