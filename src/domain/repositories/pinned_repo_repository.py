"""Repository interface for pinned repositories."""

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from src.domain.entities.pinned_repo import PinnedRepo


class PinnedRepoRepository(ABC):
    """Abstract base class defining the pinned repo repository interface."""

    @abstractmethod
    async def get_all(self) -> List[PinnedRepo]:
        """Get all pinned repos ordered by display order."""
        pass

    @abstractmethod
    async def get_by_id(self, repo_id: UUID) -> Optional[PinnedRepo]:
        """Get a pinned repo by ID."""
        pass

    @abstractmethod
    async def get_by_repo_name(self, repo_name: str) -> Optional[PinnedRepo]:
        """Get a pinned repo by repository name."""
        pass

    @abstractmethod
    async def create(self, repo: PinnedRepo) -> PinnedRepo:
        """Create a new pinned repo."""
        pass

    @abstractmethod
    async def update(self, repo: PinnedRepo) -> PinnedRepo:
        """Update an existing pinned repo."""
        pass

    @abstractmethod
    async def delete(self, repo_id: UUID) -> bool:
        """Delete a pinned repo by ID."""
        pass

    @abstractmethod
    async def count(self) -> int:
        """Get the count of pinned repos."""
        pass
