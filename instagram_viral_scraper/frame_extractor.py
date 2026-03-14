"""Extract key frames from video for visual analysis."""

import base64
import io
from pathlib import Path

from rich.console import Console

from .config import Config

console = Console()


class FrameExtractor:
    """Extracts representative frames from Instagram videos for AI analysis."""

    def __init__(self, config: Config):
        self.config = config
        self.frames_dir = config.output_dir / "frames"
        self.frames_dir.mkdir(parents=True, exist_ok=True)

    def extract_frames(self, video_path: Path) -> list[Path]:
        """Extract evenly-spaced key frames from a video."""
        console.print(f"[bold blue]Extracting frames:[/] {video_path.name}")
        max_frames = self.config.max_frames_per_video

        try:
            import cv2
        except ImportError:
            console.print("[yellow]opencv not installed. pip install opencv-python-headless[/]")
            return []

        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            console.print("[yellow]Could not open video file[/]")
            return []

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            cap.release()
            return []

        # Pick evenly spaced frames
        interval = max(1, total_frames // max_frames)
        frame_indices = list(range(0, total_frames, interval))[:max_frames]

        saved_frames = []
        for idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if not ret:
                continue

            frame_path = self.frames_dir / f"{video_path.stem}_frame_{idx:05d}.jpg"
            cv2.imwrite(str(frame_path), frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            saved_frames.append(frame_path)

        cap.release()
        console.print(f"  [green]Extracted {len(saved_frames)} frames[/]")
        return saved_frames

    def frames_to_base64(self, frame_paths: list[Path], max_size: int = 800) -> list[str]:
        """Convert frame images to base64 for API calls, resizing if needed."""
        encoded = []

        try:
            from PIL import Image
        except ImportError:
            console.print("[yellow]Pillow not installed, skipping frame encoding[/]")
            return []

        for path in frame_paths:
            img = Image.open(path)
            # Resize to save tokens
            if max(img.size) > max_size:
                ratio = max_size / max(img.size)
                new_size = (int(img.width * ratio), int(img.height * ratio))
                img = img.resize(new_size, Image.LANCZOS)

            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=80)
            b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
            encoded.append(b64)

        return encoded
