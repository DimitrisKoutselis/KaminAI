"""Abstract repository interface for articles."""

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from src.domain.entities.article import Article


class ArticleRepository(ABC):
    """Abstract repository for article persistence."""

    @abstractmethod
    async def save(self, article: Article) -> None:
        """Save or update an article."""
        pass

    @abstractmethod
    async def get_by_id(self, article_id: UUID) -> Optional[Article]:
        """Get an article by its ID."""
        pass

    @abstractmethod
    async def get_by_slug(self, slug: str) -> Optional[Article]:
        """Get an article by its slug."""
        pass

    @abstractmethod
    async def list_all(self, published_only: bool = True, limit: int = 100) -> List[Article]:
        """List all articles, optionally filtered by publication status."""
        pass

    @abstractmethod
    async def delete(self, article_id: UUID) -> None:
        """Delete an article by its ID."""
        pass

    @abstractmethod
    async def exists(self, article_id: UUID) -> bool:
        """Check if an article exists."""
        pass
