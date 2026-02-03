"""MongoDB implementation of PinnedRepoRepository."""

from typing import List, Optional
from uuid import UUID

from motor.motor_asyncio import AsyncIOMotorCollection

from src.domain.entities.pinned_repo import PinnedRepo
from src.domain.repositories.pinned_repo_repository import PinnedRepoRepository


class MongoDBPinnedRepoRepository(PinnedRepoRepository):
    """MongoDB implementation of the pinned repo repository."""

    def __init__(self, collection: AsyncIOMotorCollection):
        self._collection = collection

    async def get_all(self) -> List[PinnedRepo]:
        """Get all pinned repos ordered by display order."""
        cursor = self._collection.find().sort("order", 1)
        docs = await cursor.to_list(length=100)
        return [self._to_entity(doc) for doc in docs]

    async def get_by_id(self, repo_id: UUID) -> Optional[PinnedRepo]:
        """Get a pinned repo by ID."""
        doc = await self._collection.find_one({"_id": str(repo_id)})
        return self._to_entity(doc) if doc else None

    async def get_by_repo_name(self, repo_name: str) -> Optional[PinnedRepo]:
        """Get a pinned repo by repository name."""
        doc = await self._collection.find_one({"repo_name": repo_name})
        return self._to_entity(doc) if doc else None

    async def create(self, repo: PinnedRepo) -> PinnedRepo:
        """Create a new pinned repo."""
        doc = {
            "_id": str(repo.id),
            "repo_name": repo.repo_name,
            "display_name": repo.display_name,
            "description": repo.description,
            "url": repo.url,
            "language": repo.language,
            "stars": repo.stars,
            "forks": repo.forks,
            "topics": repo.topics,
            "order": repo.order,
            "pinned_at": repo.pinned_at,
        }
        await self._collection.insert_one(doc)
        return repo

    async def update(self, repo: PinnedRepo) -> PinnedRepo:
        """Update an existing pinned repo."""
        doc = {
            "_id": str(repo.id),
            "repo_name": repo.repo_name,
            "display_name": repo.display_name,
            "description": repo.description,
            "url": repo.url,
            "language": repo.language,
            "stars": repo.stars,
            "forks": repo.forks,
            "topics": repo.topics,
            "order": repo.order,
            "pinned_at": repo.pinned_at,
        }
        await self._collection.replace_one({"_id": str(repo.id)}, doc)
        return repo

    async def delete(self, repo_id: UUID) -> bool:
        """Delete a pinned repo by ID."""
        result = await self._collection.delete_one({"_id": str(repo_id)})
        return result.deleted_count > 0

    async def count(self) -> int:
        """Get the count of pinned repos."""
        return await self._collection.count_documents({})

    def _to_entity(self, doc: dict) -> PinnedRepo:
        """Convert MongoDB document to PinnedRepo entity."""
        return PinnedRepo(
            id=UUID(doc["_id"]),
            repo_name=doc["repo_name"],
            display_name=doc["display_name"],
            description=doc.get("description"),
            url=doc["url"],
            language=doc.get("language"),
            stars=doc.get("stars", 0),
            forks=doc.get("forks", 0),
            topics=doc.get("topics", []),
            order=doc.get("order", 0),
            pinned_at=doc["pinned_at"],
        )
