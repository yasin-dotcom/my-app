"""Instagram video scraper using yt-dlp and instaloader."""

import json
import subprocess
import re
from dataclasses import dataclass, field
from pathlib import Path

from rich.console import Console

from .config import Config

console = Console()


@dataclass
class ScrapedVideo:
    """Represents a scraped Instagram video with metadata."""

    url: str
    video_path: Path | None = None
    audio_path: Path | None = None
    thumbnail_path: Path | None = None
    caption: str = ""
    likes: int = 0
    comments: int = 0
    views: int = 0
    hashtags: list[str] = field(default_factory=list)
    username: str = ""
    video_id: str = ""

    @property
    def engagement_score(self) -> float:
        """Simple engagement heuristic."""
        return self.likes + (self.comments * 3) + (self.views * 0.01)


class InstagramScraper:
    """Scrapes Instagram Reels and posts containing video."""

    def __init__(self, config: Config):
        self.config = config
        self.download_dir = config.output_dir / "videos"
        self.download_dir.mkdir(parents=True, exist_ok=True)

    def scrape_url(self, url: str) -> ScrapedVideo:
        """Download a single Instagram video by URL."""
        console.print(f"[bold blue]Downloading:[/] {url}")
        video_id = self._extract_video_id(url)
        output_template = str(self.download_dir / f"{video_id}.%(ext)s")

        cmd = [
            "yt-dlp",
            "--no-check-certificates",
            "-o", output_template,
            "--write-info-json",
            "--write-thumbnail",
            "--extract-audio", "--audio-format", "mp3",
            "--keep-video",
            url,
        ]

        if self.config.instagram_username:
            cmd.extend(["--username", self.config.instagram_username])
        if self.config.instagram_password:
            cmd.extend(["--password", self.config.instagram_password])

        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=120
            )
            if result.returncode != 0:
                console.print(f"[yellow]yt-dlp warning:[/] {result.stderr[:200]}")
        except subprocess.TimeoutExpired:
            console.print("[red]Download timed out[/]")
            return ScrapedVideo(url=url, video_id=video_id)
        except FileNotFoundError:
            console.print("[red]yt-dlp not found. Install it: pip install yt-dlp[/]")
            return ScrapedVideo(url=url, video_id=video_id)

        return self._build_video_result(url, video_id)

    def scrape_hashtag(self, hashtag: str, max_results: int = 10) -> list[str]:
        """Search for reel URLs by hashtag using instaloader."""
        console.print(f"[bold blue]Searching hashtag:[/] #{hashtag}")
        urls = []

        try:
            import instaloader
            loader = instaloader.Instaloader(
                download_videos=False,
                download_pictures=False,
                download_comments=False,
                save_metadata=False,
            )

            if self.config.instagram_username and self.config.instagram_password:
                loader.login(
                    self.config.instagram_username,
                    self.config.instagram_password,
                )

            hashtag_obj = instaloader.Hashtag.from_name(loader.context, hashtag)
            count = 0
            for post in hashtag_obj.get_top_posts():
                if count >= max_results:
                    break
                if post.is_video:
                    urls.append(f"https://www.instagram.com/p/{post.shortcode}/")
                    count += 1

        except ImportError:
            console.print("[yellow]instaloader not installed, using URL-only mode[/]")
        except Exception as e:
            console.print(f"[yellow]Hashtag search failed: {e}[/]")

        console.print(f"  Found {len(urls)} video URLs for #{hashtag}")
        return urls

    def scrape_profile_reels(self, username: str, max_results: int = 10) -> list[str]:
        """Get recent reel URLs from a profile."""
        console.print(f"[bold blue]Fetching reels from:[/] @{username}")
        urls = []

        try:
            import instaloader
            loader = instaloader.Instaloader(
                download_videos=False,
                download_pictures=False,
                download_comments=False,
                save_metadata=False,
            )

            if self.config.instagram_username and self.config.instagram_password:
                loader.login(
                    self.config.instagram_username,
                    self.config.instagram_password,
                )

            profile = instaloader.Profile.from_username(loader.context, username)
            count = 0
            for post in profile.get_posts():
                if count >= max_results:
                    break
                if post.is_video:
                    urls.append(f"https://www.instagram.com/p/{post.shortcode}/")
                    count += 1

        except Exception as e:
            console.print(f"[yellow]Profile scrape failed: {e}[/]")

        console.print(f"  Found {len(urls)} videos from @{username}")
        return urls

    def _extract_video_id(self, url: str) -> str:
        """Extract shortcode or ID from Instagram URL."""
        patterns = [
            r"instagram\.com/reel/([A-Za-z0-9_-]+)",
            r"instagram\.com/reels/([A-Za-z0-9_-]+)",
            r"instagram\.com/p/([A-Za-z0-9_-]+)",
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return url.rstrip("/").split("/")[-1]

    def _build_video_result(self, url: str, video_id: str) -> ScrapedVideo:
        """Build ScrapedVideo from downloaded files."""
        video = ScrapedVideo(url=url, video_id=video_id)

        # Find downloaded files
        for f in self.download_dir.iterdir():
            if not f.stem.startswith(video_id):
                continue
            if f.suffix in (".mp4", ".webm", ".mkv"):
                video.video_path = f
            elif f.suffix == ".mp3":
                video.audio_path = f
            elif f.suffix in (".jpg", ".png", ".webp"):
                video.thumbnail_path = f
            elif f.suffix == ".json":
                self._parse_info_json(f, video)

        return video

    def _parse_info_json(self, json_path: Path, video: ScrapedVideo) -> None:
        """Parse yt-dlp info JSON for metadata."""
        try:
            data = json.loads(json_path.read_text())
            video.caption = data.get("description", "")
            video.likes = data.get("like_count", 0) or 0
            video.comments = data.get("comment_count", 0) or 0
            video.views = data.get("view_count", 0) or 0
            video.username = data.get("uploader", "") or data.get("channel", "")
            video.hashtags = [
                tag for tag in re.findall(r"#(\w+)", video.caption)
            ]
        except (json.JSONDecodeError, OSError):
            pass
