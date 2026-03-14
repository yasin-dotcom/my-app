"""Audio transcription from video files."""

import subprocess
from pathlib import Path

from rich.console import Console

from .config import Config

console = Console()


class Transcriber:
    """Extracts and transcribes audio from Instagram videos."""

    def __init__(self, config: Config):
        self.config = config
        self.audio_dir = config.output_dir / "audio"
        self.audio_dir.mkdir(parents=True, exist_ok=True)

    def extract_audio(self, video_path: Path) -> Path | None:
        """Extract audio track from a video file using ffmpeg."""
        audio_path = self.audio_dir / f"{video_path.stem}.mp3"
        if audio_path.exists():
            return audio_path

        try:
            subprocess.run(
                [
                    "ffmpeg", "-i", str(video_path),
                    "-vn", "-acodec", "libmp3lame", "-q:a", "4",
                    "-y", str(audio_path),
                ],
                capture_output=True, timeout=60,
            )
            if audio_path.exists() and audio_path.stat().st_size > 0:
                return audio_path
        except (subprocess.TimeoutExpired, FileNotFoundError) as e:
            console.print(f"[yellow]Audio extraction failed: {e}[/]")

        return None

    def transcribe(self, audio_path: Path) -> str:
        """Transcribe audio using OpenAI Whisper API or local whisper."""
        console.print(f"[bold blue]Transcribing:[/] {audio_path.name}")

        # Try OpenAI Whisper API first
        if self.config.openai_api_key:
            return self._transcribe_openai(audio_path)

        # Fall back to local whisper
        return self._transcribe_local(audio_path)

    def transcribe_from_video(self, video_path: Path) -> str:
        """Extract audio and transcribe in one step."""
        audio_path = self.extract_audio(video_path)
        if not audio_path:
            console.print("[yellow]No audio extracted, skipping transcription[/]")
            return ""
        return self.transcribe(audio_path)

    def _transcribe_openai(self, audio_path: Path) -> str:
        """Transcribe using OpenAI Whisper API."""
        try:
            from openai import OpenAI

            client = OpenAI(api_key=self.config.openai_api_key)
            with open(audio_path, "rb") as f:
                response = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=f,
                    response_format="text",
                )
            transcript = str(response).strip()
            console.print(f"  [green]Transcribed {len(transcript)} chars (OpenAI)[/]")
            return transcript

        except Exception as e:
            console.print(f"[yellow]OpenAI transcription failed: {e}[/]")
            return self._transcribe_local(audio_path)

    def _transcribe_local(self, audio_path: Path) -> str:
        """Transcribe using local whisper CLI."""
        try:
            result = subprocess.run(
                [
                    "whisper", str(audio_path),
                    "--model", "base",
                    "--output_format", "txt",
                    "--output_dir", str(self.audio_dir),
                ],
                capture_output=True, text=True, timeout=300,
            )
            txt_path = self.audio_dir / f"{audio_path.stem}.txt"
            if txt_path.exists():
                transcript = txt_path.read_text().strip()
                console.print(
                    f"  [green]Transcribed {len(transcript)} chars (local)[/]"
                )
                return transcript
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass

        console.print("[yellow]Local whisper not available. Install: pip install openai-whisper[/]")
        return ""
