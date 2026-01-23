"""MongoDB implementation of ArticleRepository."""

from typing import List, Optional
from uuid import UUID

from motor.motor_asyncio import AsyncIOMotorCollection

from src.domain.entities.article import Article
from src.domain.repositories.article_repository import ArticleRepository


class MongoDBArticleRepository(ArticleRepository):
    """MongoDB implementation of the article repository."""

    def __init__(self, collection: AsyncIOMotorCollection):
        self._collection = collection

    async def save(self, article: Article) -> None:
        """Save or update an article."""
        doc = {
            "_id": str(article.id),
            "title": article.title,
            "slug": article.slug,
            "content": article.content,
            "summary": article.summary,
            "tags": article.tags,
            "published": article.published,
            "featured": article.featured,
            "created_at": article.created_at,
            "updated_at": article.updated_at,
            "author": article.author,
            "image_url": article.image_url,
        }
        await self._collection.replace_one({"_id": str(article.id)}, doc, upsert=True)

    async def get_by_id(self, article_id: UUID) -> Optional[Article]:
        """Get an article by its ID."""
        doc = await self._collection.find_one({"_id": str(article_id)})
        return self._to_entity(doc) if doc else None

    async def get_by_slug(self, slug: str) -> Optional[Article]:
        """Get an article by its slug."""
        doc = await self._collection.find_one({"slug": slug})
        return self._to_entity(doc) if doc else None

    async def list_all(self, published_only: bool = True, limit: int = 100) -> List[Article]:
        """List all articles, optionally filtered by publication status."""
        query = {"published": True} if published_only else {}
        cursor = self._collection.find(query).sort("created_at", -1).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [self._to_entity(doc) for doc in docs]

    async def delete(self, article_id: UUID) -> None:
        """Delete an article by its ID."""
        await self._collection.delete_one({"_id": str(article_id)})

    async def exists(self, article_id: UUID) -> bool:
        """Check if an article exists."""
        count = await self._collection.count_documents({"_id": str(article_id)}, limit=1)
        return count > 0

    def _to_entity(self, doc: dict) -> Article:
        """Convert MongoDB document to Article entity."""
        return Article(
            id=UUID(doc["_id"]),
            title=doc["title"],
            slug=doc["slug"],
            content=doc["content"],
            summary=doc["summary"],
            tags=doc.get("tags", []),
            published=doc.get("published", False),
            featured=doc.get("featured", False),
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
            author=doc.get("author", ""),
            image_url=doc.get("image_url"),
        )
