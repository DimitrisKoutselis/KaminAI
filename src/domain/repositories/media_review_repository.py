"""Abstract repository interface for media reviews."""

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from src.domain.entities.media_review import MediaReview


class MediaReviewRepository(ABC):
    """Abstract repository for media review persistence."""

    @abstractmethod
    async def save(self, review: MediaReview) -> None:
        """Save or update a media review."""
        pass

    @abstractmethod
    async def get_by_id(self, review_id: UUID) -> Optional[MediaReview]:
        """Get a media review by its ID."""
        pass

    @abstractmethod
    async def get_by_article(self, article_id: UUID) -> List[MediaReview]:
        """Get all media reviews from a specific article."""
        pass

    @abstractmethod
    async def get_by_type(self, media_type: str) -> List[MediaReview]:
        """Get all media reviews of a specific type, sorted by rating desc."""
        pass

    @abstractmethod
    async def list_all(self, limit: int = 100) -> List[MediaReview]:
        """List all media reviews, sorted by rating desc."""
        pass

    @abstractmethod
    async def delete(self, review_id: UUID) -> None:
        """Delete a media review by its ID."""
        pass

    @abstractmethod
    async def delete_by_article(self, article_id: UUID) -> None:
        """Delete all media reviews from a specific article."""
        pass

    @abstractmethod
    async def exists_for_media(self, title: str, media_type: str, article_id: UUID) -> bool:
        """Check if a review for this media already exists from this article."""
        pass
