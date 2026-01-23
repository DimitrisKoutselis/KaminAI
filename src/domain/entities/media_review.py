"""MediaReview entity representing a rated media item extracted from blog articles."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4


@dataclass
class MediaReview:
    """Domain entity representing a media review extracted from articles."""

    id: UUID
    title: str  # Media title (movie, series, game, book name)
    media_type: str  # "movie" | "series" | "game" | "book"
    rating: float  # 1-10 scale
    year: Optional[str]  # Release year
    external_id: Optional[str]  # TMDB ID, IGDB ID, Open Library key
    external_url: Optional[str]  # Link to IMDB/IGDB/OpenLibrary
    poster_url: Optional[str]  # Cover image URL
    keywords: List[str]  # Keywords/tags from external database
    article_id: Optional[UUID]  # Reference to source article (None for manual entries)
    article_slug: str  # For easy linking
    article_title: str  # For display purposes
    created_at: datetime

    @classmethod
    def create(
        cls,
        title: str,
        media_type: str,
        rating: float,
        article_id: Optional[UUID] = None,
        article_slug: Optional[str] = None,
        article_title: Optional[str] = None,
        year: Optional[str] = None,
        external_id: Optional[str] = None,
        external_url: Optional[str] = None,
        poster_url: Optional[str] = None,
        keywords: Optional[List[str]] = None,
    ) -> "MediaReview":
        """Factory method to create a new media review."""
        valid_types = {"movie", "series", "game", "book"}
        if media_type not in valid_types:
            raise ValueError(f"media_type must be one of {valid_types}")

        rating = max(1.0, min(10.0, rating))

        return cls(
            id=uuid4(),
            title=title,
            media_type=media_type,
            rating=rating,
            year=year,
            external_id=external_id,
            external_url=external_url,
            poster_url=poster_url,
            keywords=keywords or [],
            article_id=article_id,
            article_slug=article_slug or "",
            article_title=article_title or "",
            created_at=datetime.now(timezone.utc),
        )

    def update_external_info(
        self,
        external_id: Optional[str] = None,
        external_url: Optional[str] = None,
        poster_url: Optional[str] = None,
        year: Optional[str] = None,
        keywords: Optional[List[str]] = None,
    ) -> None:
        """Update external database information."""
        if external_id is not None:
            self.external_id = external_id
        if external_url is not None:
            self.external_url = external_url
        if poster_url is not None:
            self.poster_url = poster_url
        if year is not None:
            self.year = year
        if keywords is not None:
            self.keywords = keywords

    def to_dict(self) -> dict:
        """Convert entity to dictionary for persistence."""
        return {
            "id": str(self.id),
            "title": self.title,
            "media_type": self.media_type,
            "rating": self.rating,
            "year": self.year,
            "external_id": self.external_id,
            "external_url": self.external_url,
            "poster_url": self.poster_url,
            "keywords": self.keywords,
            "article_id": str(self.article_id) if self.article_id else None,
            "article_slug": self.article_slug,
            "article_title": self.article_title,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "MediaReview":
        """Create entity from dictionary."""
        article_id = data.get("article_id")
        if article_id and isinstance(article_id, str):
            article_id = UUID(article_id)

        return cls(
            id=UUID(data["id"]) if isinstance(data["id"], str) else data["id"],
            title=data["title"],
            media_type=data["media_type"],
            rating=data["rating"],
            year=data.get("year"),
            external_id=data.get("external_id"),
            external_url=data.get("external_url"),
            poster_url=data.get("poster_url"),
            keywords=data.get("keywords", []),
            article_id=article_id,
            article_slug=data.get("article_slug", ""),
            article_title=data.get("article_title", ""),
            created_at=data["created_at"],
        )
