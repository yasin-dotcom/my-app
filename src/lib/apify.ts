import { getSetting } from "./settings";

export interface ScrapedReel {
  id: string;
  url: string;
  ownerUsername: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl: string;
  videoViewCount: number;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
  videoDuration: number;
}

interface ApifyReelItem {
  id?: string;
  shortCode?: string;
  url?: string;
  ownerUsername?: string;
  caption?: string;
  videoUrl?: string;
  displayUrl?: string;
  thumbnailUrl?: string;
  videoViewCount?: number;
  likesCount?: number;
  commentsCount?: number;
  timestamp?: string;
  videoDuration?: number;
  videoPlayCount?: number;
}

export async function searchInstagramReels(
  query: string,
  dateFrom?: string,
  dateTo?: string,
  maxResults: number = 30
): Promise<ScrapedReel[]> {
  const apiKey = getSetting("apify_api_key");
  if (!apiKey) {
    throw new Error("Apify API key not configured. Go to Settings to add it.");
  }

  // Use the Instagram Hashtag Scraper actor
  const actorId = "apify~instagram-hashtag-scraper";
  const runUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apiKey}`;

  // Clean query - remove # if present
  const hashtag = query.replace(/^#/, "").trim();

  const response = await fetch(runUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      hashtags: [hashtag],
      resultsLimit: maxResults,
      resultsType: "posts",
    }),
    signal: AbortSignal.timeout(120000), // 2 min timeout
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Apify API error (${response.status}): ${text}`);
  }

  const items: ApifyReelItem[] = await response.json();

  // Filter by date if specified and map to our format
  let reels: ScrapedReel[] = items
    .filter((item) => item.videoUrl) // Only video posts (reels)
    .map((item) => ({
      id: item.id || item.shortCode || "",
      url: item.url || `https://www.instagram.com/reel/${item.shortCode}/`,
      ownerUsername: item.ownerUsername || "",
      caption: item.caption || "",
      videoUrl: item.videoUrl || "",
      thumbnailUrl: item.displayUrl || item.thumbnailUrl || "",
      videoViewCount: item.videoViewCount || item.videoPlayCount || 0,
      likesCount: item.likesCount || 0,
      commentsCount: item.commentsCount || 0,
      timestamp: item.timestamp || "",
      videoDuration: item.videoDuration || 0,
    }));

  // Date filtering
  if (dateFrom) {
    const from = new Date(dateFrom);
    reels = reels.filter((r) => !r.timestamp || new Date(r.timestamp) >= from);
  }
  if (dateTo) {
    const to = new Date(dateTo);
    reels = reels.filter((r) => !r.timestamp || new Date(r.timestamp) <= to);
  }

  // Sort by views descending
  reels.sort((a, b) => b.videoViewCount - a.videoViewCount);

  return reels;
}
