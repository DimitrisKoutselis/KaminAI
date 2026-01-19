"""MongoDB implementation of MediaReviewRepository."""

from typing import List, Optional
from uuid import UUID

from motor.motor_asyncio import AsyncIOMotorCollection

from src.domain.entities.media_review import MediaReview
from src.domain.repositories.media_review_repository import MediaReviewRepository


class MongoDBMediaReviewRepository(MediaReviewRepository):
    """MongoDB implementation of the media review repository."""

    def __init__(self, collection: AsyncIOMotorCollection):
        self._collection = collection

    async def save(self, review: MediaReview) -> None:
        """Save or update a media review."""
        doc = {
            "_id": str(review.id),
            "title": review.title,
            "media_type": review.media_type,
            "rating": review.rating,
            "year": review.year,
            "external_id": review.external_id,
            "external_url": review.external_url,
            "poster_url": review.poster_url,
            "keywords": review.keywords,
            "article_id": str(review.article_id),
            "article_slug": review.article_slug,
            "article_title": review.article_title,
            "created_at": review.created_at,
        }
        await self._collection.replace_one({"_id": str(review.id)}, doc, upsert=True)

    async def get_by_id(self, review_id: UUID) -> Optional[MediaReview]:
        """Get a media review by its ID."""
        doc = await self._collection.find_one({"_id": str(review_id)})
        return self._to_entity(doc) if doc else None

    async def get_by_article(self, article_id: UUID) -> List[MediaReview]:
        """Get all media reviews from a specific article."""
        cursor = self._collection.find({"article_id": str(article_id)}).sort("rating", -1)
        docs = await cursor.to_list(length=100)
        return [self._to_entity(doc) for doc in docs]

    async def get_by_type(self, media_type: str) -> List[MediaReview]:
        """Get all media reviews of a specific type, sorted by rating desc."""
        cursor = self._collection.find({"media_type": media_type}).sort("rating", -1)
        docs = await cursor.to_list(length=100)
        return [self._to_entity(doc) for doc in docs]

    async def list_all(self, limit: int = 100) -> List[MediaReview]:
        """List all media reviews, sorted by rating desc."""
        cursor = self._collection.find().sort("rating", -1).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [self._to_entity(doc) for doc in docs]

    async def delete(self, review_id: UUID) -> None:
        """Delete a media review by its ID."""
        await self._collection.delete_one({"_id": str(review_id)})

    async def delete_by_article(self, article_id: UUID) -> None:
        """Delete all media reviews from a specific article."""
        await self._collection.delete_many({"article_id": str(article_id)})

    async def exists_for_media(self, title: str, media_type: str, article_id: UUID) -> bool:
        """Check if a review for this media already exists from this article."""
        count = await self._collection.count_documents(
            {
                "title": {"$regex": f"^{title}$", "$options": "i"},
                "media_type": media_type,
                "article_id": str(article_id),
            },
            limit=1,
        )
        return count > 0

    def _to_entity(self, doc: dict) -> MediaReview:
        """Convert MongoDB document to MediaReview entity."""
        return MediaReview(
            id=UUID(doc["_id"]),
            title=doc["title"],
            media_type=doc["media_type"],
            rating=doc["rating"],
            year=doc.get("year"),
            external_id=doc.get("external_id"),
            external_url=doc.get("external_url"),
            poster_url=doc.get("poster_url"),
            keywords=doc.get("keywords", []),
            article_id=UUID(doc["article_id"]),
            article_slug=doc["article_slug"],
            article_title=doc.get("article_title", ""),
            created_at=doc["created_at"],
        )
