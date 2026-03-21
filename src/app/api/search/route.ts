import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { searchTikTokVideos } from "@/lib/tiktok";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, dateFrom, dateTo, minViews, maxResults } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Search TikTok via Apify
    const videos = await searchTikTokVideos(
      query.trim(),
      dateFrom,
      dateTo,
      minViews || 0,
      maxResults || 30
    );

    // Store search and results in DB
    const db = getDb();

    const searchResult = db
      .prepare(
        "INSERT INTO searches (query, date_from, date_to, result_count) VALUES (?, ?, ?, ?)"
      )
      .run(query.trim(), dateFrom || null, dateTo || null, videos.length);

    const searchId = searchResult.lastInsertRowid;

    const insertReel = db.prepare(`
      INSERT INTO reels (search_id, instagram_id, instagram_url, creator_handle, caption, views, likes, comments_count, shares, saves, duration_seconds, thumbnail_url, video_url, posted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(instagram_id) DO UPDATE SET
        views = excluded.views,
        likes = excluded.likes,
        comments_count = excluded.comments_count,
        shares = excluded.shares,
        saves = excluded.saves,
        search_id = excluded.search_id
    `);

    const storedVideos = [];

    for (const video of videos) {
      const videoId = video.id || video.url;
      if (!videoId) continue;

      insertReel.run(
        searchId,
        videoId,
        video.url,
        video.authorUsername,
        video.caption,
        video.views,
        video.likes,
        video.comments,
        video.shares,
        video.saves,
        video.duration,
        video.thumbnailUrl,
        video.videoUrl,
        video.createdAt
      );

      const row = db
        .prepare("SELECT id FROM reels WHERE instagram_id = ?")
        .get(videoId) as { id: number } | undefined;

      storedVideos.push({
        id: row?.id,
        tiktok_id: videoId,
        url: video.url,
        creator_handle: video.authorUsername,
        creator_name: video.authorName,
        caption: video.caption,
        views: video.views,
        likes: video.likes,
        comments_count: video.comments,
        shares: video.shares,
        saves: video.saves,
        duration_seconds: video.duration,
        thumbnail_url: video.thumbnailUrl,
        posted_at: video.createdAt,
      });
    }

    return NextResponse.json({
      searchId,
      query: query.trim(),
      resultCount: storedVideos.length,
      reels: storedVideos,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
