"""PinnedRepo entity representing a pinned GitHub repository."""

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4


@dataclass
class PinnedRepo:
    """Domain entity representing a pinned GitHub repository."""

    id: UUID
    repo_name: str
    display_name: str
    description: Optional[str]
    url: str
    language: Optional[str]
    stars: int
    forks: int
    topics: List[str]
    order: int
    pinned_at: datetime

    @classmethod
    def create(
        cls,
        repo_name: str,
        display_name: str,
        description: Optional[str],
        url: str,
        language: Optional[str],
        stars: int,
        forks: int,
        topics: Optional[List[str]] = None,
        order: int = 0,
    ) -> "PinnedRepo":
        """Factory method to create a new pinned repo."""
        return cls(
            id=uuid4(),
            repo_name=repo_name,
            display_name=display_name,
            description=description,
            url=url,
            language=language,
            stars=stars,
            forks=forks,
            topics=topics or [],
            order=order,
            pinned_at=datetime.now(timezone.utc),
        )

    def update_order(self, order: int) -> None:
        """Update the display order."""
        self.order = order

    def update_from_github(
        self,
        description: Optional[str],
        stars: int,
        forks: int,
        topics: List[str],
    ) -> None:
        """Update repo data from GitHub API."""
        self.description = description
        self.stars = stars
        self.forks = forks
        self.topics = topics

    def to_dict(self) -> dict:
        """Convert entity to dictionary for persistence."""
        return {
            "id": str(self.id),
            "repo_name": self.repo_name,
            "display_name": self.display_name,
            "description": self.description,
            "url": self.url,
            "language": self.language,
            "stars": self.stars,
            "forks": self.forks,
            "topics": self.topics,
            "order": self.order,
            "pinned_at": self.pinned_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "PinnedRepo":
        """Create entity from dictionary."""
        return cls(
            id=UUID(data["id"]) if isinstance(data["id"], str) else data["id"],
            repo_name=data["repo_name"],
            display_name=data["display_name"],
            description=data.get("description"),
            url=data["url"],
            language=data.get("language"),
            stars=data.get("stars", 0),
            forks=data.get("forks", 0),
            topics=data.get("topics", []),
            order=data.get("order", 0),
            pinned_at=data["pinned_at"],
        )
