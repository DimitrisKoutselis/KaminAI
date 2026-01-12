"""Article application service."""

from typing import List, Optional
from uuid import UUID

from src.domain.entities.article import Article
from src.domain.repositories.article_repository import ArticleRepository
from src.application.dto.article_dto import CreateArticleDTO, UpdateArticleDTO


class ArticleService:
    """Application service for article operations."""

    def __init__(
        self,
        article_repository: ArticleRepository,
    ):
        """Initialize the article service.

        Args:
            article_repository: Repository for article persistence
        """
        self._repository = article_repository

    async def create_article(self, dto: CreateArticleDTO) -> Article:
        """Create a new article.

        Args:
            dto: Data for creating the article

        Returns:
            The created article
        """
        article = Article.create(
            title=dto.title,
            content=dto.content,
            summary=dto.summary,
            tags=dto.tags,
            author=dto.author,
        )

        await self._repository.save(article)
        return article

    async def update_article(self, article_id: UUID, dto: UpdateArticleDTO) -> Article:
        """Update an existing article.

        Args:
            article_id: ID of the article to update
            dto: Data for updating the article

        Returns:
            The updated article

        Raises:
            ValueError: If article not found
        """
        article = await self._repository.get_by_id(article_id)
        if not article:
            raise ValueError(f"Article {article_id} not found")

        # Update fields
        article.update(
            title=dto.title,
            content=dto.content,
            summary=dto.summary,
            tags=dto.tags,
        )

        # Handle publish status separately
        if dto.published is not None:
            if dto.published:
                article.publish()
            else:
                article.unpublish()

        await self._repository.save(article)
        return article

    async def get_article(self, article_id: UUID) -> Optional[Article]:
        """Get an article by ID.

        Args:
            article_id: ID of the article

        Returns:
            The article if found, None otherwise
        """
        return await self._repository.get_by_id(article_id)

    async def get_article_by_slug(self, slug: str) -> Optional[Article]:
        """Get an article by slug.

        Args:
            slug: URL slug of the article

        Returns:
            The article if found, None otherwise
        """
        return await self._repository.get_by_slug(slug)

    async def list_articles(
        self, published_only: bool = True, limit: int = 100
    ) -> List[Article]:
        """List all articles.

        Args:
            published_only: If True, only return published articles
            limit: Maximum number of articles to return

        Returns:
            List of articles
        """
        return await self._repository.list_all(
            published_only=published_only, limit=limit
        )

    async def delete_article(self, article_id: UUID) -> None:
        """Delete an article.

        Args:
            article_id: ID of the article to delete

        Raises:
            ValueError: If article not found
        """
        exists = await self._repository.exists(article_id)
        if not exists:
            raise ValueError(f"Article {article_id} not found")

        await self._repository.delete(article_id)

    async def publish_article(self, article_id: UUID) -> Article:
        """Publish an article.

        Args:
            article_id: ID of the article to publish

        Returns:
            The updated article

        Raises:
            ValueError: If article not found
        """
        article = await self._repository.get_by_id(article_id)
        if not article:
            raise ValueError(f"Article {article_id} not found")

        article.publish()
        await self._repository.save(article)
        return article

    async def unpublish_article(self, article_id: UUID) -> Article:
        """Unpublish an article (move to draft).

        Args:
            article_id: ID of the article to unpublish

        Returns:
            The updated article

        Raises:
            ValueError: If article not found
        """
        article = await self._repository.get_by_id(article_id)
        if not article:
            raise ValueError(f"Article {article_id} not found")

        article.unpublish()
        await self._repository.save(article)
        return article
