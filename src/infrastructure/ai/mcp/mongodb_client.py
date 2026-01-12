"""MongoDB client for blog article access."""

from typing import Any

from src.infrastructure.persistence.mongodb.connection import get_database


class MongoDBArticleClient:
    """Client for querying blog articles from MongoDB."""

    def __init__(self) -> None:
        self._db = None

    def _get_collection(self):
        """Get the articles collection."""
        if self._db is None:
            self._db = get_database()
        return self._db["articles"]

    async def get_all_articles(self, published_only: bool = True) -> list[dict[str, Any]]:
        """Fetch all articles from the database."""
        collection = self._get_collection()
        query: dict[str, Any] = {}
        if published_only:
            query["published"] = True

        cursor = collection.find(query).sort("created_at", -1)
        articles = await cursor.to_list(length=100)

        return [
            {
                "id": str(article["_id"]),
                "title": article.get("title", ""),
                "slug": article.get("slug", ""),
                "summary": article.get("summary", ""),
                "content": article.get("content", ""),
                "tags": article.get("tags", []),
                "created_at": str(article.get("created_at", "")),
                "updated_at": str(article.get("updated_at", "")),
            }
            for article in articles
        ]

    async def get_article_by_slug(self, slug: str) -> dict[str, Any] | None:
        """Fetch a specific article by its slug."""
        collection = self._get_collection()
        article = await collection.find_one({"slug": slug, "published": True})

        if not article:
            return None

        return {
            "id": str(article["_id"]),
            "title": article.get("title", ""),
            "slug": article.get("slug", ""),
            "summary": article.get("summary", ""),
            "content": article.get("content", ""),
            "tags": article.get("tags", []),
            "created_at": str(article.get("created_at", "")),
            "updated_at": str(article.get("updated_at", "")),
        }

    async def search_articles(
        self, query: str, tags: list[str] | None = None
    ) -> list[dict[str, Any]]:
        """Search articles by text query and optional tags."""
        collection = self._get_collection()

        search_query: dict[str, Any] = {"published": True}

        if query:
            search_query["$or"] = [
                {"title": {"$regex": query, "$options": "i"}},
                {"summary": {"$regex": query, "$options": "i"}},
                {"content": {"$regex": query, "$options": "i"}},
            ]

        if tags:
            search_query["tags"] = {"$in": tags}

        cursor = collection.find(search_query).sort("created_at", -1)
        articles = await cursor.to_list(length=20)

        return [
            {
                "id": str(article["_id"]),
                "title": article.get("title", ""),
                "slug": article.get("slug", ""),
                "summary": article.get("summary", ""),
                "content": article.get("content", ""),
                "tags": article.get("tags", []),
                "created_at": str(article.get("created_at", "")),
            }
            for article in articles
        ]

    async def get_recent_articles(self, limit: int = 5) -> list[dict[str, Any]]:
        """Get the most recent published articles."""
        collection = self._get_collection()
        cursor = collection.find({"published": True}).sort("created_at", -1).limit(limit)
        articles = await cursor.to_list(length=limit)

        return [
            {
                "id": str(article["_id"]),
                "title": article.get("title", ""),
                "slug": article.get("slug", ""),
                "summary": article.get("summary", ""),
                "tags": article.get("tags", []),
                "created_at": str(article.get("created_at", "")),
            }
            for article in articles
        ]

    async def get_articles_by_tag(self, tag: str) -> list[dict[str, Any]]:
        """Get all articles with a specific tag."""
        collection = self._get_collection()
        cursor = collection.find({"published": True, "tags": tag}).sort("created_at", -1)
        articles = await cursor.to_list(length=50)

        return [
            {
                "id": str(article["_id"]),
                "title": article.get("title", ""),
                "slug": article.get("slug", ""),
                "summary": article.get("summary", ""),
                "tags": article.get("tags", []),
                "created_at": str(article.get("created_at", "")),
            }
            for article in articles
        ]


_mongodb_client: MongoDBArticleClient | None = None


def get_mongodb_article_client() -> MongoDBArticleClient:
    """Get the singleton MongoDB article client instance."""
    global _mongodb_client
    if _mongodb_client is None:
        _mongodb_client = MongoDBArticleClient()
    return _mongodb_client
