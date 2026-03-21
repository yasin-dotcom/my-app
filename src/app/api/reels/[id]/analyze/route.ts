import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { downloadVideo, extractAudio, extractFrames, cleanup } from "@/lib/video";
import { transcribeAudio } from "@/lib/transcribe";
import { analyzeFrames } from "@/lib/vision";

interface ReelRow {
  id: number;
  instagram_url: string;
  video_url: string;
  caption: string;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const tempFiles: string[] = [];

  try {
    const { id } = await params;
    const db = getDb();

    const reel = db.prepare("SELECT * FROM reels WHERE id = ?").get(id) as ReelRow | undefined;
    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    const videoUrl = reel.video_url || reel.instagram_url;
    if (!videoUrl) {
      return NextResponse.json(
        { error: "No video URL available for this reel" },
        { status: 400 }
      );
    }

    // Step 1: Download video
    let videoPath: string;
    try {
      videoPath = await downloadVideo(videoUrl);
      tempFiles.push(videoPath);
    } catch (err) {
      return NextResponse.json(
        { error: `Video download failed: ${(err as Error).message}` },
        { status: 500 }
      );
    }

    // Step 2: Extract audio and transcribe
    let transcript = "";
    try {
      const audioPath = await extractAudio(videoPath);
      tempFiles.push(audioPath);
      transcript = await transcribeAudio(audioPath);

      // Store transcript
      db.prepare(
        "INSERT INTO transcripts (reel_id, text) VALUES (?, ?) ON CONFLICT(reel_id) DO UPDATE SET text = excluded.text"
      ).run(id, transcript);
    } catch (err) {
      // Transcription failure is non-fatal - continue with visual analysis
      console.error("Transcription failed:", (err as Error).message);
      transcript = `(Transcription failed: ${(err as Error).message})`;
    }

    // Step 3: Extract frames and analyze visually
    let visualResult = null;
    try {
      const framePaths = await extractFrames(videoPath, 6);
      tempFiles.push(...framePaths);

      if (framePaths.length > 0) {
        visualResult = await analyzeFrames(
          framePaths,
          reel.caption || "",
          transcript
        );

        // Store visual analysis
        db.prepare(
          `INSERT INTO visual_analyses (reel_id, frame_descriptions, overall_analysis, hook_analysis, content_style)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(reel_id) DO UPDATE SET
             frame_descriptions = excluded.frame_descriptions,
             overall_analysis = excluded.overall_analysis,
             hook_analysis = excluded.hook_analysis,
             content_style = excluded.content_style`
        ).run(
          id,
          JSON.stringify(visualResult.frameDescriptions),
          visualResult.overallAnalysis,
          visualResult.hookAnalysis,
          visualResult.contentStyle
        );
      }
    } catch (err) {
      console.error("Visual analysis failed:", (err as Error).message);
      visualResult = { error: (err as Error).message };
    }

    return NextResponse.json({
      success: true,
      reelId: id,
      transcript,
      visualAnalysis: visualResult,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  } finally {
    cleanup(tempFiles);
  }
}
