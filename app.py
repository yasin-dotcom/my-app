"""Streamlit web app for the Instagram Viral Book Scraper."""

import json
from datetime import datetime
from pathlib import Path

import streamlit as st

from instagram_viral_scraper.analyzer import ViralAnalyzer, VideoAnalysis
from instagram_viral_scraper.config import Config
from instagram_viral_scraper.frame_extractor import FrameExtractor
from instagram_viral_scraper.scraper import InstagramScraper
from instagram_viral_scraper.transcriber import Transcriber

st.set_page_config(
    page_title="Viral Book Scraper",
    page_icon="📚",
    layout="wide",
)


def init_config() -> Config:
    """Build config from sidebar inputs."""
    config = Config()

    with st.sidebar:
        st.header("Settings")

        anthropic_key = st.text_input(
            "Anthropic API Key",
            value=config.anthropic_api_key,
            type="password",
            help="For video analysis with Claude",
        )
        openai_key = st.text_input(
            "OpenAI API Key",
            value=config.openai_api_key,
            type="password",
            help="For video analysis with GPT-4o and/or Whisper transcription",
        )
        ig_user = st.text_input(
            "Instagram Username (optional)",
            value=config.instagram_username,
            help="For accessing more content via hashtag/profile search",
        )
        ig_pass = st.text_input(
            "Instagram Password (optional)",
            value=config.instagram_password,
            type="password",
        )
        max_frames = st.slider("Frames per video", 3, 20, 10)

    config.anthropic_api_key = anthropic_key
    config.openai_api_key = openai_key
    config.instagram_username = ig_user
    config.instagram_password = ig_pass
    config.max_frames_per_video = max_frames
    return config


def process_video(
    url: str,
    config: Config,
    scraper: InstagramScraper,
    transcriber: Transcriber,
    extractor: FrameExtractor,
    analyzer: ViralAnalyzer,
) -> VideoAnalysis | None:
    """Process a single video URL through the full pipeline."""
    video = scraper.scrape_url(url)
    if not video.video_path:
        st.warning(f"Download failed for {url}")
        return None

    transcript = transcriber.transcribe_from_video(video.video_path)
    frame_paths = extractor.extract_frames(video.video_path)
    frame_b64 = extractor.frames_to_base64(frame_paths)

    analysis = analyzer.analyze_video(video, transcript, frame_b64)
    analysis.frame_paths = frame_paths
    return analysis


def show_results(results: list[VideoAnalysis], analyzer: ViralAnalyzer):
    """Display analysis results."""
    # Source videos table
    st.subheader("Source Videos")
    for i, r in enumerate(results, 1):
        cols = st.columns([0.5, 2, 3, 1, 1, 1])
        cols[0].write(f"**{i}**")
        cols[1].write(f"@{r.video.username}")
        cols[2].markdown(f"[Open Reel]({r.video.url})")
        cols[3].metric("Views", f"{r.video.views:,}")
        cols[4].metric("Likes", f"{r.video.likes:,}")
        cols[5].metric("Comments", f"{r.video.comments:,}")

    st.divider()

    # Synthesize
    with st.spinner("Generating viral playbook from all videos..."):
        playbook = analyzer.synthesize_findings(results)

    st.subheader("Viral Playbook")
    st.markdown(playbook)

    st.divider()

    # Individual analyses
    st.subheader("Individual Video Analyses")
    for i, r in enumerate(results, 1):
        with st.expander(
            f"Video {i}: @{r.video.username} — {r.video.views:,} views",
            expanded=False,
        ):
            st.markdown(f"**URL:** [{r.video.url}]({r.video.url})")
            st.markdown(
                f"**Views:** {r.video.views:,} | "
                f"**Likes:** {r.video.likes:,} | "
                f"**Comments:** {r.video.comments:,}"
            )
            if r.video.caption:
                st.markdown(f"**Caption:** {r.video.caption[:300]}")

            # Show extracted frames
            if r.frame_paths:
                frame_cols = st.columns(min(len(r.frame_paths), 5))
                for j, fp in enumerate(r.frame_paths[:5]):
                    frame_cols[j].image(str(fp), use_container_width=True)

            if r.transcript:
                with st.expander("Transcript"):
                    st.text(r.transcript)

            st.markdown("#### Analysis")
            st.markdown(r.analysis_text)

    # Download buttons
    st.divider()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

    report_md = f"# Viral Book Marketing Report\n\n*Generated: {timestamp}*\n"
    report_md += f"*Videos analyzed: {len(results)}*\n\n"
    report_md += "## Source Videos\n\n"
    for i, r in enumerate(results, 1):
        label = f"@{r.video.username}" if r.video.username else "unknown"
        report_md += f"{i}. [{label} — {r.video.views:,} views]({r.video.url})\n"
    report_md += "\n---\n\n## Viral Playbook\n\n" + playbook + "\n\n---\n\n"
    report_md += "## Individual Video Analyses\n\n"
    for i, r in enumerate(results, 1):
        report_md += f"### Video {i}: @{r.video.username}\n\n"
        report_md += f"- **URL:** [{r.video.url}]({r.video.url})\n"
        report_md += f"- **Views:** {r.video.views:,} | **Likes:** {r.video.likes:,} | **Comments:** {r.video.comments:,}\n"
        if r.video.caption:
            report_md += f"- **Caption:** {r.video.caption[:200]}...\n"
        report_md += f"\n{r.analysis_text}\n\n---\n\n"

    json_data = [
        {
            "url": r.video.url,
            "username": r.video.username,
            "views": r.video.views,
            "likes": r.video.likes,
            "comments": r.video.comments,
            "caption": r.video.caption,
            "hashtags": r.video.hashtags,
            "transcript": r.transcript,
            "analysis": r.analysis_text,
        }
        for r in results
    ]

    col1, col2 = st.columns(2)
    col1.download_button(
        "Download Report (Markdown)",
        report_md,
        file_name="viral_book_report.md",
        mime="text/markdown",
    )
    col2.download_button(
        "Download Raw Data (JSON)",
        json.dumps(json_data, indent=2),
        file_name="viral_book_report.json",
        mime="application/json",
    )


def main():
    st.title("📚 Viral Book Scraper")
    st.caption("Analyze what makes book content go viral on Instagram")

    config = init_config()

    # Check for API key
    has_key = bool(config.anthropic_api_key or config.openai_api_key)
    if not has_key:
        st.warning("Enter an Anthropic or OpenAI API key in the sidebar to get started.")

    tab_urls, tab_search, tab_profile = st.tabs([
        "Analyze URLs", "Search Hashtags", "Analyze Profile",
    ])

    with tab_urls:
        st.markdown("Paste Instagram Reel URLs (one per line):")
        url_input = st.text_area(
            "Reel URLs",
            placeholder="https://www.instagram.com/reel/ABC123/\nhttps://www.instagram.com/reel/XYZ789/",
            height=150,
            label_visibility="collapsed",
        )
        run_urls = st.button("Analyze Reels", type="primary", disabled=not has_key, key="run_urls")

    with tab_search:
        st.markdown("Search for viral book content by hashtag:")
        hashtag_input = st.text_input(
            "Hashtags (comma-separated)",
            value="booktok, bookstagram, viralbooks",
            help="Without the # symbol",
        )
        max_per_tag = st.number_input("Max videos per hashtag", 1, 20, 5)
        run_search = st.button("Search & Analyze", type="primary", disabled=not has_key, key="run_search")

    with tab_profile:
        st.markdown("Analyze a specific creator's reels:")
        profile_input = st.text_input("Instagram username", placeholder="bookfluencer123")
        max_profile = st.number_input("Max videos", 1, 30, 10)
        run_profile = st.button("Analyze Profile", type="primary", disabled=not has_key, key="run_profile")

    # --- Execution ---

    scraper = InstagramScraper(config)
    transcriber = Transcriber(config)
    extractor = FrameExtractor(config)
    analyzer = ViralAnalyzer(config)

    urls_to_process: list[str] = []

    if run_urls and url_input.strip():
        urls_to_process = [u.strip() for u in url_input.strip().splitlines() if u.strip()]

    if run_search:
        tags = [t.strip() for t in hashtag_input.split(",") if t.strip()]
        with st.spinner(f"Searching {len(tags)} hashtags..."):
            for tag in tags:
                urls_to_process.extend(scraper.scrape_hashtag(tag, max_results=max_per_tag))
        urls_to_process = list(dict.fromkeys(urls_to_process))
        if urls_to_process:
            st.info(f"Found {len(urls_to_process)} unique videos")
        else:
            st.warning("No videos found. Try pasting URLs directly.")

    if run_profile and profile_input.strip():
        with st.spinner(f"Fetching reels from @{profile_input}..."):
            urls_to_process = scraper.scrape_profile_reels(profile_input.strip(), max_results=max_profile)
        if urls_to_process:
            st.info(f"Found {len(urls_to_process)} videos")
        else:
            st.warning("No videos found for this profile.")

    if urls_to_process:
        results: list[VideoAnalysis] = []
        progress = st.progress(0, text="Starting...")

        for i, url in enumerate(urls_to_process):
            progress.progress(
                (i) / len(urls_to_process),
                text=f"Processing video {i + 1}/{len(urls_to_process)}...",
            )
            result = process_video(url, config, scraper, transcriber, extractor, analyzer)
            if result:
                results.append(result)

        progress.progress(1.0, text="Done!")

        if results:
            show_results(results, analyzer)
        else:
            st.error("No videos were successfully processed.")


if __name__ == "__main__":
    main()
