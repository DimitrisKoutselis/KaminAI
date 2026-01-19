"""Leaderboard API schemas."""

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

from src.domain.entities.media_review import MediaReview


class MediaReviewCreate(BaseModel):
    """Schema for manually creating a media review."""

    title: str = Field(..., min_length=1, max_length=500)
    media_type: Literal["movie", "series", "game", "book"]
    rating: float = Field(..., ge=1.0, le=10.0)
    year: Optional[str] = Field(None, pattern=r"^\d{4}$")
    article_id: Optional[str] = Field(
        None, description="Optional article ID if the review is linked to an article"
    )


class MediaReviewResponse(BaseModel):
    """Response schema for a single media review."""

    id: str
    title: str
    media_type: str
    rating: float
    year: Optional[str]
    external_id: Optional[str]
    external_url: Optional[str]
    poster_url: Optional[str]
    article_id: Optional[str]
    article_slug: str
    article_title: str
    created_at: datetime

    @classmethod
    def from_entity(cls, review: MediaReview) -> "MediaReviewResponse":
        """Create response from domain entity."""
        return cls(
            id=str(review.id),
            title=review.title,
            media_type=review.media_type,
            rating=review.rating,
            year=review.year,
            external_id=review.external_id,
            external_url=review.external_url,
            poster_url=review.poster_url,
            article_id=str(review.article_id) if review.article_id else None,
            article_slug=review.article_slug,
            article_title=review.article_title,
            created_at=review.created_at,
        )


class LeaderboardResponse(BaseModel):
    """Response schema for the full leaderboard."""

    movies: List[MediaReviewResponse]
    series: List[MediaReviewResponse]
    games: List[MediaReviewResponse]
    books: List[MediaReviewResponse]


class MediaReviewListResponse(BaseModel):
    """Response schema for a list of media reviews."""

    reviews: List[MediaReviewResponse]
    total: int
