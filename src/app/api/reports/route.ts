import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateWeeklyReport, type ReelAnalysis, type EngagementMetrics, type ServiceInsights, type HookAnalysis, type ScriptStructure, type ConversionTrigger } from "@/lib/analyzer";

interface RawAnalysis {
  hook_style: string;
  hook_framework: string;
  script_template: string;
  emotional_arc: string;
  conversion_triggers: string;
  engagement_rate: number;
  save_rate: number;
  lead_score: number;
  authority_indicators: string;
  booking_intent_signals: string;
  content_category: string;
  target_audience: string;
  duration_seconds: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const reportId = searchParams.get("id");

    const db = getDb();

    // Get specific report by ID
    if (reportId) {
      const report = db
        .prepare("SELECT * FROM weekly_reports WHERE id = ?")
        .get(reportId) as { report_data: string } | undefined;

      if (!report) {
        return NextResponse.json({ error: "Report not found." }, { status: 404 });
      }

      return NextResponse.json({ report: JSON.parse(report.report_data) });
    }

    // Get reports for a user by email
    if (email) {
      const user = db
        .prepare("SELECT id, business_type FROM beta_signups WHERE email = ?")
        .get(email) as { id: number; business_type: string } | undefined;

      if (!user) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      const reports = db
        .prepare(
          "SELECT id, report_date, status, created_at FROM weekly_reports WHERE user_id = ? ORDER BY report_date DESC"
        )
        .all(user.id);

      return NextResponse.json({ reports });
    }

    return NextResponse.json({ error: "Email or report ID required." }, { status: 400 });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Failed to fetch reports." }, { status: 500 });
  }
}

// Generate a weekly report for a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const db = getDb();

    const user = db
      .prepare("SELECT id, business_type FROM beta_signups WHERE email = ?")
      .get(email) as { id: number; business_type: string } | undefined;

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Get recent analyses
    const rawAnalyses = db
      .prepare(
        `SELECT ra.*, r.duration_seconds FROM reel_analyses ra
         JOIN reels r ON ra.reel_id = r.id
         ORDER BY ra.created_at DESC LIMIT 100`
      )
      .all() as RawAnalysis[];

    if (rawAnalyses.length === 0) {
      return NextResponse.json(
        { error: "Not enough data to generate a report yet." },
        { status: 400 }
      );
    }

    // Convert to ReelAnalysis format
    const analyses: ReelAnalysis[] = rawAnalyses.map((ra) => ({
      hook: {
        style: ra.hook_style,
        framework: ra.hook_framework,
        description: "",
        openingSeconds: 2,
        patternInterrupt: ra.hook_style === "pattern_interrupt",
        textOverlay: true,
      } as HookAnalysis,
      script: {
        segments: JSON.parse(ra.script_template || "[]"),
        emotionalArc: ra.emotional_arc,
        totalDuration: ra.duration_seconds || 30,
      } as unknown as ScriptStructure,
      conversionTriggers: JSON.parse(ra.conversion_triggers || "[]") as ConversionTrigger[],
      metrics: {
        engagementRate: ra.engagement_rate,
        saveRate: ra.save_rate,
        commentRate: 0,
        shareRate: 0,
        leadScore: ra.lead_score,
        performanceTier: ra.lead_score > 80 ? "top_5_percent" : "above_average",
      } as EngagementMetrics,
      serviceInsights: {
        authorityIndicators: JSON.parse(ra.authority_indicators || "[]"),
        bookingIntentSignals: JSON.parse(ra.booking_intent_signals || "[]"),
        leadGenScore: ra.lead_score,
        idealFor: JSON.parse(ra.target_audience || "[]"),
        contentCategory: ra.content_category,
      } as unknown as ServiceInsights,
    }));

    const report = generateWeeklyReport(analyses, user.business_type);

    // Store the report
    db.prepare(
      `INSERT INTO weekly_reports (user_id, report_date, report_data)
       VALUES (?, ?, ?)`
    ).run(user.id, report.reportDate, JSON.stringify(report));

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report." },
      { status: 500 }
    );
  }
}
