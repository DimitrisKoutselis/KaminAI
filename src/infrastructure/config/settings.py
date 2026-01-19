"""Application settings loaded from environment variables."""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field
import json


class Settings(BaseSettings):
    """Application configuration settings."""

    # Application
    app_name: str = Field(default="KaminAI")
    debug: bool = Field(default=False)
    api_version: str = Field(default="v1")

    # MongoDB
    mongodb_uri: str = Field(default="mongodb://localhost:27017")
    mongodb_database: str = Field(default="kaminai")

    # GitHub (for portfolio)
    github_token: str = Field(default="")
    github_username: str = Field(default="")

    # Google Gemini AI
    google_api_key: str = Field(default="")
    gemini_model: str = Field(default="gemini-2.5-flash")
    gemini_embedding_model: str = Field(default="text-embedding-004")

    # FAISS Vector Store
    faiss_index_path: str = Field(default="./data/faiss_index")
    embedding_dimension: int = Field(default=768)

    # Bio file for Response Generator
    bio_file_path: str = Field(default="./my_bio.md")

    # LangSmith tracing
    langsmith_api_key: str = Field(default="")
    langsmith_project: str = Field(default="kaminai")
    langsmith_tracing: bool = Field(default=False)

    # External Media APIs (for Leaderboard feature)
    tmdb_api_key: str = Field(default="")
    igdb_client_id: str = Field(default="")
    igdb_client_secret: str = Field(default="")

    # JWT Authentication
    jwt_secret_key: str = Field(default="your-secret-key-change-in-production")
    jwt_algorithm: str = Field(default="HS256")
    jwt_expiration_hours: int = Field(default=24)

    # Admin credentials (for initial setup)
    admin_username: str = Field(default="admin")
    admin_password: str = Field(default="admin")

    # Admin profile
    admin_first_name: str = Field(default="")
    admin_last_name: str = Field(default="")
    admin_nickname: str = Field(default="")
    admin_birthday: str = Field(default="")  # Format: YYYY-MM-DD

    # CORS - stored as JSON string in env, parsed to list
    cors_origins: str = Field(default='["http://localhost:5173","http://localhost:3000"]')

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from JSON string to list."""
        try:
            return json.loads(self.cors_origins)
        except json.JSONDecodeError:
            return ["http://localhost:5173", "http://localhost:3000"]

    @property
    def admin_display_name(self) -> str:
        """Get the display name for admin user.

        Prefers nickname if it exists, otherwise 'Last Name First Name'.
        """
        if self.admin_nickname:
            return self.admin_nickname
        if self.admin_first_name or self.admin_last_name:
            return f"{self.admin_last_name} {self.admin_first_name}".strip()
        return self.admin_username

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


# Global settings instance
_settings: Settings | None = None


def get_settings() -> Settings:
    """Get the global settings instance."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
