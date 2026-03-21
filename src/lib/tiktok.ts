import { getSetting } from "./settings";

export interface ScrapedVideo {
  id: string;
  url: string;
  authorName: string;
  authorUsername: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  duration: number;
  createdAt: string;
}

interface ApifyTikTokItem {
  id?: string;
  webVideoUrl?: string;
  authorMeta?: {
    name?: string;
    nickName?: string;
  };
  text?: string;
  videoUrl?: string;
  videoMeta?: {
    coverUrl?: string;
    duration?: number;
    downloadAddr?: string;
  };
  playCount?: number;
  diggCount?: number;
  commentCount?: number;
  shareCount?: number;
  collectCount?: number;
  createTimeISO?: string;
  createTime?: number;
  // Alternative field names from different scrapers
  plays?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  cover?: string;
  video?: { url?: string; cover?: string; duration?: number };
  author?: { uniqueId?: string; nickname?: string; name?: string };
  desc?: string;
}

export async function searchTikTokVideos(
  query: string,
  dateFrom?: string,
  dateTo?: string,
  minViews: number = 0,
  maxResults: number = 30
): Promise<ScrapedVideo[]> {
  const apiKey = getSetting("apify_api_key");
  if (!apiKey) {
    throw new Error(
      "Apify API key not configured. Go to Settings to add it."
    );
  }

  // Use the free TikTok scraper actor
  const actorId = "clockworks~free-tiktok-scraper";
  const runUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apiKey}`;

  const searchTerm = query.replace(/^#/, "").trim();

  const response = await fetch(runUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      searchQueries: [searchTerm],
      maxProfilesPerQuery: 1,
      resultsPerPage: maxResults,
      shouldDownloadCovers: false,
      shouldDownloadVideos: false,
    }),
    signal: AbortSignal.timeout(180000), // 3 min timeout for scraping
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 401) {
      throw new Error("Invalid Apify API key. Check your key in Settings.");
    }
    throw new Error(`Apify API error (${response.status}): ${text.slice(0, 200)}`);
  }

  const items: ApifyTikTokItem[] = await response.json();

  if (!Array.isArray(items)) {
    throw new Error("Unexpected API response format. Got: " + typeof items);
  }

  if (items.length === 0) {
    throw new Error(
      `Apify returned 0 results for "${searchTerm}". The scraper may be rate-limited — try again in a few minutes.`
    );
  }

  // Map to our format, handling different field name conventions
  let videos: ScrapedVideo[] = items.map((item) => {
    const authorUsername =
      item.authorMeta?.name ||
      item.author?.uniqueId ||
      item.author?.name ||
      "";
    const authorName =
      item.authorMeta?.nickName ||
      item.author?.nickname ||
      authorUsername;

    const views = item.playCount ?? item.plays ?? 0;
    const likes = item.diggCount ?? item.likes ?? 0;
    const comments = item.commentCount ?? item.comments ?? 0;
    const shares = item.shareCount ?? item.shares ?? 0;
    const saves = item.collectCount ?? item.saves ?? 0;

    const videoUrl =
      item.videoUrl ||
      item.videoMeta?.downloadAddr ||
      item.video?.url ||
      "";
    const thumbnailUrl =
      item.videoMeta?.coverUrl ||
      item.cover ||
      item.video?.cover ||
      "";
    const duration =
      item.videoMeta?.duration ||
      item.video?.duration ||
      0;

    let createdAt = "";
    if (item.createTimeISO) {
      createdAt = item.createTimeISO;
    } else if (item.createTime) {
      createdAt = new Date(item.createTime * 1000).toISOString();
    }

    return {
      id: item.id || "",
      url: item.webVideoUrl || "",
      authorName,
      authorUsername,
      caption: item.text || item.desc || "",
      videoUrl,
      thumbnailUrl,
      views,
      likes,
      comments,
      shares,
      saves,
      duration,
      createdAt,
    };
  });

  // Filter by min views
  if (minViews > 0) {
    videos = videos.filter((v) => v.views >= minViews);
  }

  // Filter by date range
  if (dateFrom) {
    const from = new Date(dateFrom);
    videos = videos.filter(
      (v) => !v.createdAt || new Date(v.createdAt) >= from
    );
  }
  if (dateTo) {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    videos = videos.filter(
      (v) => !v.createdAt || new Date(v.createdAt) <= to
    );
  }

  // Sort by views descending
  videos.sort((a, b) => b.views - a.views);

  return videos;
}
