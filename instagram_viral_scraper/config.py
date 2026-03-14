"""Configuration management."""

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Config:
    """App configuration loaded from environment variables."""

    anthropic_api_key: str = ""
    openai_api_key: str = ""
    instagram_username: str = ""
    instagram_password: str = ""
    output_dir: Path = Path("./downloads")
    max_frames_per_video: int = 10
    search_hashtags: list[str] = field(default_factory=lambda: [
        "booktok", "bookstagram", "bookrecommendations", "bookmarketing",
        "authorsofinstagram", "booklaunch", "bookselling", "viralbooks",
        "bookreels", "authortok", "writersofinstagram", "selfpublishing",
    ])

    def __post_init__(self):
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        self.instagram_username = os.getenv("INSTAGRAM_USERNAME", "")
        self.instagram_password = os.getenv("INSTAGRAM_PASSWORD", "")
        self.output_dir = Path(os.getenv("OUTPUT_DIR", "./downloads"))
        self.output_dir.mkdir(parents=True, exist_ok=True)

    @property
    def ai_provider(self) -> str:
        if self.anthropic_api_key:
            return "anthropic"
        if self.openai_api_key:
            return "openai"
        raise ValueError(
            "Set ANTHROPIC_API_KEY or OPENAI_API_KEY in your .env file"
        )
