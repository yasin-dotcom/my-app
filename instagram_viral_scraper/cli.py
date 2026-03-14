"""CLI entry point for the Instagram Viral Scraper."""

import json
from datetime import datetime
from pathlib import Path

import click
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from .analyzer import ViralAnalyzer, VideoAnalysis
from .config import Config
from .frame_extractor import FrameExtractor
from .scraper import InstagramScraper, ScrapedVideo
from .transcriber import Transcriber

console = Console()


def print_banner():
    console.print(Panel.fit(
        "[bold magenta]Instagram Viral Book Scraper[/]\n"
        "Analyze what makes book content go viral on Instagram",
        border_style="magenta",
    ))


@click.group()
def cli():
    """Instagram Viral Scraper - Find what makes book Reels go viral."""
    pass


@cli.command()
@click.argument("urls", nargs=-1, required=True)
@click.option("--output", "-o", default="report.md", help="Output report file")
def analyze_urls(urls: tuple[str, ...], output: str):
    """Analyze specific Instagram Reel URLs.

    Example: python -m instagram_viral_scraper analyze-urls URL1 URL2 URL3
    """
    print_banner()
    config = Config()
    results = _process_urls(list(urls), config)
    _generate_report(results, config, output)


@cli.command()
@click.option("--hashtags", "-t", multiple=True, help="Hashtags to search (without #)")
@click.option("--max-per-tag", default=5, help="Max videos per hashtag")
@click.option("--output", "-o", default="report.md", help="Output report file")
def search(hashtags: tuple[str, ...], max_per_tag: int, output: str):
    """Search hashtags for viral book content and analyze.

    Example: python -m instagram_viral_scraper search -t booktok -t bookstagram
    """
    print_banner()
    config = Config()
    scraper = InstagramScraper(config)

    tags = list(hashtags) if hashtags else config.search_hashtags
    all_urls: list[str] = []

    for tag in tags:
        urls = scraper.scrape_hashtag(tag, max_results=max_per_tag)
        all_urls.extend(urls)

    if not all_urls:
        console.print("[red]No videos found. Try providing URLs directly.[/]")
        return

    # Deduplicate
    all_urls = list(dict.fromkeys(all_urls))
    console.print(f"\n[bold]Found {len(all_urls)} unique videos to analyze[/]\n")

    results = _process_urls(all_urls, config)
    _generate_report(results, config, output)


@cli.command()
@click.argument("username")
@click.option("--max-videos", default=10, help="Max videos to analyze")
@click.option("--output", "-o", default="report.md", help="Output report file")
def analyze_profile(username: str, max_videos: int, output: str):
    """Analyze a specific creator's reels.

    Example: python -m instagram_viral_scraper analyze-profile bookfluencer123
    """
    print_banner()
    config = Config()
    scraper = InstagramScraper(config)

    urls = scraper.scrape_profile_reels(username, max_results=max_videos)
    if not urls:
        console.print("[red]No videos found for this profile.[/]")
        return

    results = _process_urls(urls, config)
    _generate_report(results, config, output)


def _process_urls(urls: list[str], config: Config) -> list[VideoAnalysis]:
    """Download, transcribe, extract frames, and analyze videos."""
    scraper = InstagramScraper(config)
    transcriber = Transcriber(config)
    extractor = FrameExtractor(config)
    analyzer = ViralAnalyzer(config)

    results: list[VideoAnalysis] = []

    for i, url in enumerate(urls, 1):
        console.rule(f"[bold]Video {i}/{len(urls)}[/]")

        # 1. Download
        video = scraper.scrape_url(url)
        if not video.video_path:
            console.print(f"[yellow]Skipping {url} - download failed[/]")
            continue

        # 2. Transcribe
        transcript = transcriber.transcribe_from_video(video.video_path)

        # 3. Extract frames
        frame_paths = extractor.extract_frames(video.video_path)
        frame_b64 = extractor.frames_to_base64(frame_paths)

        # 4. Analyze
        analysis = analyzer.analyze_video(video, transcript, frame_b64)
        analysis.frame_paths = frame_paths
        results.append(analysis)

    return results


def _generate_report(results: list[VideoAnalysis], config: Config, output_path: str):
    """Generate the final viral marketing report."""
    if not results:
        console.print("[red]No videos were successfully analyzed.[/]")
        return

    analyzer = ViralAnalyzer(config)

    # Print summary table
    table = Table(title="Analyzed Videos")
    table.add_column("Username", style="cyan")
    table.add_column("Views", justify="right")
    table.add_column("Likes", justify="right")
    table.add_column("Has Transcript", justify="center")

    for r in results:
        table.add_row(
            f"@{r.video.username}",
            f"{r.video.views:,}",
            f"{r.video.likes:,}",
            "Yes" if r.transcript else "No",
        )

    console.print(table)

    # Synthesize findings
    playbook = analyzer.synthesize_findings(results)

    # Write report
    report_path = Path(output_path)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

    report = f"# Viral Book Marketing Report\n\n"
    report += f"*Generated: {timestamp}*\n"
    report += f"*Videos analyzed: {len(results)}*\n\n"
    report += "---\n\n"
    report += "## Viral Playbook\n\n"
    report += playbook + "\n\n"
    report += "---\n\n"
    report += "## Individual Video Analyses\n\n"

    for i, r in enumerate(results, 1):
        report += f"### Video {i}: @{r.video.username}\n\n"
        report += f"- **URL:** {r.video.url}\n"
        report += f"- **Views:** {r.video.views:,} | **Likes:** {r.video.likes:,} | **Comments:** {r.video.comments:,}\n"
        if r.video.caption:
            report += f"- **Caption:** {r.video.caption[:200]}...\n"
        report += f"\n{r.analysis_text}\n\n---\n\n"

    report_path.write_text(report)
    console.print(f"\n[bold green]Report saved to:[/] {report_path.absolute()}")
    console.print(Panel(playbook[:1000] + "...", title="Playbook Preview", border_style="green"))

    # Also save raw data as JSON
    json_path = report_path.with_suffix(".json")
    json_data = []
    for r in results:
        json_data.append({
            "url": r.video.url,
            "username": r.video.username,
            "views": r.video.views,
            "likes": r.video.likes,
            "comments": r.video.comments,
            "caption": r.video.caption,
            "hashtags": r.video.hashtags,
            "transcript": r.transcript,
            "analysis": r.analysis_text,
        })
    json_path.write_text(json.dumps(json_data, indent=2))
    console.print(f"[bold green]Raw data saved to:[/] {json_path.absolute()}")
