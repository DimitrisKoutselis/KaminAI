"""Abstract repository interface for admin profile."""

from abc import ABC, abstractmethod
from typing import Optional

from src.domain.entities.admin_profile import AdminProfile


class AdminProfileRepository(ABC):
    """Abstract repository for admin profile persistence (singleton)."""

    @abstractmethod
    async def get(self) -> Optional[AdminProfile]:
        """Get the singleton admin profile."""
        pass

    @abstractmethod
    async def save(self, profile: AdminProfile) -> None:
        """Save or update the admin profile."""
        pass

    @abstractmethod
    async def exists(self) -> bool:
        """Check if admin profile exists in database."""
        pass
