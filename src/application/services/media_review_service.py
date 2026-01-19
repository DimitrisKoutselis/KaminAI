"""Media review application service."""

import logging
from typing import List, Optional
from uuid import UUID

from src.domain.entities.article import Article
from src.domain.entities.media_review import MediaReview
from src.domain.repositories.article_repository import ArticleRepository
from src.domain.repositories.media_review_repository import MediaReviewRepository
from src.infrastructure.ai.agents.review_extractor import extract_reviews_from_content
from src.infrastructure.external.tmdb_client import TMDBClient
from src.infrastructure.external.igdb_client import IGDBClient
from src.infrastructure.external.openlibrary_client import OpenLibraryClient

logger = logging.getLogger(__name__)


class MediaReviewService:
    """Application service for media review operations."""

    def __init__(
        self,
        review_repository: MediaReviewRepository,
        article_repository: Optional[ArticleRepository] = None,
        tmdb_client: Optional[TMDBClient] = None,
        igdb_client: Optional[IGDBClient] = None,
        openlibrary_client: Optional[OpenLibraryClient] = None,
    ):
        self._repository = review_repository
        self._article_repository = article_repository
        self._tmdb = tmdb_client
        self._igdb = igdb_client
        self._openlibrary = openlibrary_client or OpenLibraryClient()

    async def extract_and_store_reviews(self, article: Article) -> List[MediaReview]:
        """Extract reviews from article content and store them.

        Also updates the article's tags with keywords from external databases.

        Args:
            article: The article to extract reviews from

        Returns:
            List of extracted and stored MediaReview entities
        """
        # First, delete any existing reviews for this article (re-extraction)
        await self._repository.delete_by_article(article.id)

        # Extract reviews using LLM (include title and summary for better context)
        extracted = await extract_reviews_from_content(
            content=article.content,
            title=article.title,
            summary=article.summary,
        )

        if not extracted:
            logger.info(f"No reviews found in article: {article.title}")
            return []

        reviews = []
        all_keywords: List[str] = []

        for extract in extracted:
            try:
                # Create the review entity
                review = MediaReview.create(
                    title=extract.title,
                    media_type=extract.media_type,
                    rating=extract.rating,
                    article_id=article.id,
                    article_slug=article.slug,
                    article_title=article.title,
                    year=extract.year,
                )

                # Try to enrich with external data
                await self._enrich_review(review)

                # Collect keywords from the review
                if review.keywords:
                    all_keywords.extend(review.keywords)

                # Save to database
                await self._repository.save(review)
                reviews.append(review)

                logger.info(
                    f"Extracted and stored review: {review.title} ({review.media_type}) - {review.rating}/10"
                )
            except Exception as e:
                logger.error(f"Error processing review for {extract.title}: {e}")
                continue

        # Update article tags with keywords from external databases
        if all_keywords and self._article_repository:
            await self._update_article_tags_with_keywords(article, all_keywords)

        return reviews

    async def _update_article_tags_with_keywords(
        self, article: Article, keywords: List[str]
    ) -> None:
        """Update article tags with keywords from external databases.

        Args:
            article: The article to update
            keywords: Keywords to add to the article's tags
        """
        try:
            # Get existing tags
            existing_tags = set(tag.lower() for tag in article.tags)

            # Filter and normalize keywords
            new_tags = []
            for keyword in keywords:
                # Normalize keyword (lowercase, strip whitespace)
                normalized = keyword.lower().strip()
                # Skip if already exists or too long
                if normalized and normalized not in existing_tags and len(normalized) <= 50:
                    new_tags.append(normalized)
                    existing_tags.add(normalized)

            if new_tags:
                # Merge existing tags with new keywords (limit to 20 total tags)
                updated_tags = article.tags + new_tags[:20 - len(article.tags)]
                article.update(tags=updated_tags)
                await self._article_repository.save(article)
                logger.info(
                    f"Added {len(new_tags)} keywords to article '{article.title}' tags"
                )
        except Exception as e:
            logger.warning(f"Failed to update article tags with keywords: {e}")

    async def _enrich_review(self, review: MediaReview) -> None:
        """Enrich review with external database information."""
        try:
            media_info = None

            if review.media_type in ("movie", "series") and self._tmdb:
                media_info = await self._tmdb.search(review.title, review.media_type, review.year)
            elif review.media_type == "game" and self._igdb:
                media_info = await self._igdb.search(review.title, review.media_type, review.year)
            elif review.media_type == "book":
                media_info = await self._openlibrary.search(review.title, review.media_type, review.year)

            if media_info:
                review.update_external_info(
                    external_id=media_info.external_id,
                    external_url=media_info.external_url,
                    poster_url=media_info.poster_url,
                    year=media_info.year or review.year,
                    keywords=media_info.keywords,
                )
                logger.debug(f"Enriched review with external data: {review.title}")
        except Exception as e:
            logger.warning(f"Failed to enrich review {review.title}: {e}")

    async def get_all_reviews(self, media_type: Optional[str] = None) -> List[MediaReview]:
        """Get all reviews, optionally filtered by type.

        Args:
            media_type: Filter by media type (movie, series, game, book)

        Returns:
            List of reviews sorted by rating (descending)
        """
        if media_type:
            return await self._repository.get_by_type(media_type)
        return await self._repository.list_all()

    async def get_reviews_by_article(self, article_id: UUID) -> List[MediaReview]:
        """Get all reviews from a specific article.

        Args:
            article_id: ID of the source article

        Returns:
            List of reviews from the article
        """
        return await self._repository.get_by_article(article_id)

    async def delete_reviews_by_article(self, article_id: UUID) -> None:
        """Delete all reviews from a specific article.

        Args:
            article_id: ID of the source article
        """
        await self._repository.delete_by_article(article_id)

    async def get_leaderboard(self) -> dict:
        """Get the full leaderboard organized by media type.

        Returns:
            Dictionary with media types as keys and sorted review lists as values
        """
        all_reviews = await self._repository.list_all(limit=500)

        leaderboard = {
            "movies": [],
            "series": [],
            "games": [],
            "books": [],
        }

        for review in all_reviews:
            if review.media_type == "movie":
                leaderboard["movies"].append(review)
            elif review.media_type == "series":
                leaderboard["series"].append(review)
            elif review.media_type == "game":
                leaderboard["games"].append(review)
            elif review.media_type == "book":
                leaderboard["books"].append(review)

        return leaderboard

    async def create_manual_review(
        self,
        title: str,
        media_type: str,
        rating: float,
        year: Optional[str] = None,
        article_id: Optional[UUID] = None,
        article_slug: Optional[str] = None,
        article_title: Optional[str] = None,
    ) -> MediaReview:
        """Manually create a media review.

        Args:
            title: The media title
            media_type: Type of media (movie, series, game, book)
            rating: Rating from 1-10
            year: Optional release year
            article_id: Optional linked article ID
            article_slug: Optional linked article slug
            article_title: Optional linked article title

        Returns:
            The created MediaReview entity
        """
        review = MediaReview.create(
            title=title,
            media_type=media_type,
            rating=rating,
            year=year,
            article_id=article_id,
            article_slug=article_slug,
            article_title=article_title,
        )

        # Try to enrich with external data
        await self._enrich_review(review)

        # Save to database
        await self._repository.save(review)

        logger.info(
            f"Manually created review: {review.title} ({review.media_type}) - {review.rating}/10"
        )

        return review
