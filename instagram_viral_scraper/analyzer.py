"""AI-powered analysis of scraped video content for viral book marketing patterns."""

import json
from dataclasses import dataclass, field
from pathlib import Path

from rich.console import Console

from .config import Config
from .scraper import ScrapedVideo

console = Console()

ANALYSIS_SYSTEM_PROMPT = """\
You are an expert social media analyst specializing in viral book marketing on Instagram.
You analyze Instagram Reels to identify what makes book-related content go viral.

Focus on:
1. HOOK - How does the video grab attention in the first 1-3 seconds?
2. VISUAL STYLE - Colors, text overlays, transitions, camera angles, lighting
3. CONTENT FORMAT - Is it a review, recommendation, haul, storytime, POV, trend?
4. EMOTIONAL TRIGGER - What emotion does it target? (curiosity, FOMO, nostalgia, etc.)
5. CALL TO ACTION - How does it drive engagement or purchases?
6. AUDIO/MUSIC - Trending sounds, voiceover style, pacing
7. TEXT/CAPTION STRATEGY - Hook text, hashtag usage, caption structure
8. BOOK PRESENTATION - How is the physical book shown? Cover reveals, aesthetic shots?

Be specific and actionable. Give concrete examples from what you observe.
"""

ANALYSIS_USER_PROMPT = """\
Analyze this Instagram Reel for viral book marketing patterns.

**Video Metadata:**
- Username: {username}
- Views: {views:,} | Likes: {likes:,} | Comments: {comments:,}
- Caption: {caption}
- Hashtags: {hashtags}

**Transcript:**
{transcript}

**Visual frames from the video are attached.**

Provide a detailed analysis covering:
1. **Hook Analysis**: What grabs attention immediately?
2. **Visual Strategy**: What visual techniques are used?
3. **Content Format**: What type of content is this?
4. **Emotional Triggers**: What emotions does it target?
5. **Virality Factors**: Why would people share/save this?
6. **Book Marketing Tactics**: Specific techniques for selling books
7. **Actionable Takeaways**: 3-5 specific things to replicate

Rate the overall viral potential (1-10) and explain why.
"""

SYNTHESIS_PROMPT = """\
You've analyzed {count} viral Instagram Reels about books. Here are the individual analyses:

{analyses}

Now synthesize these into a comprehensive **Viral Book Marketing Playbook**:

1. **Top Patterns**: What are the most common elements across viral book content?
2. **Hook Formulas**: What opening techniques work best? Give 5 specific templates.
3. **Visual Playbook**: Colors, layouts, transitions that perform best.
4. **Content Formats Ranked**: Which formats get the most engagement?
5. **Audio Strategy**: What sounds/music/voiceover styles work?
6. **Caption Templates**: 3 high-performing caption structures to copy.
7. **Hashtag Strategy**: Which hashtags appear in top-performing content?
8. **Posting Recommendations**: Based on the content analyzed.
9. **Quick-Start Checklist**: Step-by-step to create a viral book reel TODAY.

Be extremely specific and actionable. Include copy-paste templates where possible.
"""


@dataclass
class VideoAnalysis:
    """Analysis results for a single video."""

    video: ScrapedVideo
    transcript: str = ""
    frame_paths: list[Path] = field(default_factory=list)
    analysis_text: str = ""
    viral_score: float = 0.0


class ViralAnalyzer:
    """Analyzes scraped videos using AI to identify viral patterns."""

    def __init__(self, config: Config):
        self.config = config

    def analyze_video(
        self,
        video: ScrapedVideo,
        transcript: str,
        frame_base64: list[str],
    ) -> VideoAnalysis:
        """Analyze a single video's viral potential."""
        console.print(f"[bold blue]Analyzing:[/] {video.url}")

        result = VideoAnalysis(video=video, transcript=transcript)

        prompt = ANALYSIS_USER_PROMPT.format(
            username=video.username or "unknown",
            views=video.views,
            likes=video.likes,
            comments=video.comments,
            caption=video.caption[:500] if video.caption else "(no caption)",
            hashtags=", ".join(f"#{h}" for h in video.hashtags) or "(none)",
            transcript=transcript[:2000] if transcript else "(no transcript available)",
        )

        if self.config.ai_provider == "anthropic":
            result.analysis_text = self._analyze_anthropic(prompt, frame_base64)
        else:
            result.analysis_text = self._analyze_openai(prompt, frame_base64)

        console.print(f"  [green]Analysis complete ({len(result.analysis_text)} chars)[/]")
        return result

    def synthesize_findings(self, analyses: list[VideoAnalysis]) -> str:
        """Combine all individual analyses into a viral playbook."""
        console.print(f"\n[bold magenta]Synthesizing findings from {len(analyses)} videos...[/]")

        combined = ""
        for i, a in enumerate(analyses, 1):
            combined += f"\n--- VIDEO {i}: @{a.video.username} ({a.video.views:,} views) ---\n"
            combined += a.analysis_text + "\n"

        prompt = SYNTHESIS_PROMPT.format(count=len(analyses), analyses=combined[:15000])

        if self.config.ai_provider == "anthropic":
            return self._synthesize_anthropic(prompt)
        return self._synthesize_openai(prompt)

    def _analyze_anthropic(self, prompt: str, frame_base64: list[str]) -> str:
        """Run analysis using Claude."""
        import anthropic

        client = anthropic.Anthropic(api_key=self.config.anthropic_api_key)

        content: list[dict] = []

        # Add frames as images
        for b64 in frame_base64[:6]:  # Limit to 6 frames for cost
            content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": b64,
                },
            })

        content.append({"type": "text", "text": prompt})

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            system=ANALYSIS_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": content}],
        )
        return response.content[0].text

    def _analyze_openai(self, prompt: str, frame_base64: list[str]) -> str:
        """Run analysis using GPT-4 Vision."""
        from openai import OpenAI

        client = OpenAI(api_key=self.config.openai_api_key)

        content: list[dict] = []
        for b64 in frame_base64[:6]:
            content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{b64}", "detail": "low"},
            })
        content.append({"type": "text", "text": prompt})

        response = client.chat.completions.create(
            model="gpt-4o",
            max_tokens=2000,
            messages=[
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user", "content": content},
            ],
        )
        return response.choices[0].message.content or ""

    def _synthesize_anthropic(self, prompt: str) -> str:
        """Synthesize with Claude."""
        import anthropic

        client = anthropic.Anthropic(api_key=self.config.anthropic_api_key)
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            system=ANALYSIS_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text

    def _synthesize_openai(self, prompt: str) -> str:
        """Synthesize with GPT-4."""
        from openai import OpenAI

        client = OpenAI(api_key=self.config.openai_api_key)
        response = client.chat.completions.create(
            model="gpt-4o",
            max_tokens=4000,
            messages=[
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        )
        return response.choices[0].message.content or ""
