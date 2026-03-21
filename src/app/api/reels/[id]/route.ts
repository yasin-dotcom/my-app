import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const reel = db.prepare("SELECT * FROM reels WHERE id = ?").get(id);
    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    const transcript = db
      .prepare("SELECT * FROM transcripts WHERE reel_id = ?")
      .get(id);

    const visualAnalysis = db
      .prepare("SELECT * FROM visual_analyses WHERE reel_id = ?")
      .get(id);

    return NextResponse.json({
      reel,
      transcript: transcript || null,
      visualAnalysis: visualAnalysis || null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
