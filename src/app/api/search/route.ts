import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { searchInstagramReels } from "@/lib/apify";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, dateFrom, dateTo, maxResults } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Search Instagram via Apify
    const reels = await searchInstagramReels(
      query.trim(),
      dateFrom,
      dateTo,
      maxResults || 30
    );

    // Store search and results in DB
    const db = getDb();

    const searchResult = db
      .prepare(
        "INSERT INTO searches (query, date_from, date_to, result_count) VALUES (?, ?, ?, ?)"
      )
      .run(query.trim(), dateFrom || null, dateTo || null, reels.length);

    const searchId = searchResult.lastInsertRowid;

    const insertReel = db.prepare(`
      INSERT INTO reels (search_id, instagram_id, instagram_url, creator_handle, caption, views, likes, comments_count, duration_seconds, thumbnail_url, video_url, posted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(instagram_id) DO UPDATE SET
        views = excluded.views,
        likes = excluded.likes,
        comments_count = excluded.comments_count,
        search_id = excluded.search_id
    `);

    const storedReels = [];

    for (const reel of reels) {
      const result = insertReel.run(
        searchId,
        reel.id,
        reel.url,
        reel.ownerUsername,
        reel.caption,
        reel.videoViewCount,
        reel.likesCount,
        reel.commentsCount,
        reel.videoDuration,
        reel.thumbnailUrl,
        reel.videoUrl,
        reel.timestamp
      );

      // Get the actual row ID (could be existing row on conflict)
      const row = db
        .prepare("SELECT id FROM reels WHERE instagram_id = ?")
        .get(reel.id) as { id: number } | undefined;

      storedReels.push({
        id: row?.id || result.lastInsertRowid,
        instagram_id: reel.id,
        instagram_url: reel.url,
        creator_handle: reel.ownerUsername,
        caption: reel.caption,
        views: reel.videoViewCount,
        likes: reel.likesCount,
        comments_count: reel.commentsCount,
        duration_seconds: reel.videoDuration,
        thumbnail_url: reel.thumbnailUrl,
        posted_at: reel.timestamp,
      });
    }

    return NextResponse.json({
      searchId,
      query: query.trim(),
      resultCount: storedReels.length,
      reels: storedReels,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
