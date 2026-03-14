# Instagram Viral Book Scraper

Scrape Instagram Reels, extract transcripts, analyze visuals, and discover what makes book content go viral — powered by AI.

## What It Does

1. **Scrapes** Instagram Reels by URL, hashtag, or profile (via yt-dlp + instaloader)
2. **Transcribes** audio using OpenAI Whisper API or local whisper
3. **Extracts frames** from video for visual analysis (via OpenCV)
4. **Analyzes** each video with AI (Claude or GPT-4o) looking at hooks, visual style, emotional triggers, and book marketing tactics
5. **Generates a Viral Playbook** synthesizing patterns across all analyzed videos

## Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install system dependencies
# macOS:
brew install ffmpeg yt-dlp
# Ubuntu/Debian:
sudo apt install ffmpeg && pip install yt-dlp

# Configure API keys
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY or OPENAI_API_KEY
```

## Usage

### Analyze specific Reel URLs
```bash
python -m instagram_viral_scraper analyze-urls \
  "https://www.instagram.com/reel/ABC123/" \
  "https://www.instagram.com/reel/XYZ789/"
```

### Search hashtags for viral book content
```bash
# Uses default book-related hashtags
python -m instagram_viral_scraper search

# Or specify your own
python -m instagram_viral_scraper search -t booktok -t bookstagram --max-per-tag 5
```

### Analyze a specific creator's reels
```bash
python -m instagram_viral_scraper analyze-profile bookfluencer123 --max-videos 10
```

### Options
- `-o, --output` — Output report file (default: `report.md`)
- `--max-per-tag` — Max videos per hashtag (default: 5)
- `--max-videos` — Max videos for profile analysis (default: 10)

## Output

- **report.md** — Full markdown report with viral playbook and individual analyses
- **report.json** — Raw structured data for further processing
- **downloads/** — Downloaded videos, audio, and extracted frames

## How It Works

For each video, the tool:

1. Downloads the video with yt-dlp
2. Extracts the audio track and transcribes it (speech-to-text)
3. Pulls key frames from the video at even intervals
4. Sends the transcript + frames to an AI model that specializes in analyzing viral content patterns
5. After all videos are analyzed individually, synthesizes everything into a playbook with actionable templates

## Requirements

- Python 3.11+
- ffmpeg (for audio extraction)
- yt-dlp (for video downloading)
- An API key for either Anthropic (Claude) or OpenAI (GPT-4o + Whisper)
- Optional: Instagram credentials for accessing more content
