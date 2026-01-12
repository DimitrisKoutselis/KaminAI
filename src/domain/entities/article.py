"""Article entity representing a blog post."""

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4
import re


@dataclass
class Article:
    """Domain entity representing a blog article."""

    id: UUID
    title: str
    slug: str
    content: str  # Markdown content
    summary: str
    tags: List[str]
    published: bool
    created_at: datetime
    updated_at: datetime
    author: str

    @classmethod
    def create(
        cls,
        title: str,
        content: str,
        summary: str,
        tags: Optional[List[str]] = None,
        author: str = "",
    ) -> "Article":
        """Factory method to create a new article with generated slug."""
        now = datetime.now(timezone.utc)
        return cls(
            id=uuid4(),
            title=title,
            slug=cls._generate_slug(title),
            content=content,
            summary=summary,
            tags=tags or [],
            published=False,
            created_at=now,
            updated_at=now,
            author=author,
        )

    def update(
        self,
        title: Optional[str] = None,
        content: Optional[str] = None,
        summary: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> None:
        """Update article fields."""
        if title is not None:
            self.title = title
            self.slug = self._generate_slug(title)
        if content is not None:
            self.content = content
        if summary is not None:
            self.summary = summary
        if tags is not None:
            self.tags = tags

        self.updated_at = datetime.now(timezone.utc)

    def publish(self) -> None:
        """Mark article as published."""
        self.published = True
        self.updated_at = datetime.now(timezone.utc)

    def unpublish(self) -> None:
        """Mark article as unpublished (draft)."""
        self.published = False
        self.updated_at = datetime.now(timezone.utc)

    @staticmethod
    def _generate_slug(title: str) -> str:
        """Generate URL-friendly slug from title."""
        slug = title.lower()
        # Remove non-alphanumeric characters except spaces and hyphens
        slug = re.sub(r"[^a-z0-9\s-]", "", slug)
        # Replace spaces and multiple hyphens with single hyphen
        slug = re.sub(r"[\s_]+", "-", slug)
        # Remove leading/trailing hyphens
        slug = slug.strip("-")
        return slug

    def to_dict(self) -> dict:
        """Convert entity to dictionary for persistence."""
        return {
            "id": str(self.id),
            "title": self.title,
            "slug": self.slug,
            "content": self.content,
            "summary": self.summary,
            "tags": self.tags,
            "published": self.published,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "author": self.author,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Article":
        """Create entity from dictionary."""
        return cls(
            id=UUID(data["id"]) if isinstance(data["id"], str) else data["id"],
            title=data["title"],
            slug=data["slug"],
            content=data["content"],
            summary=data["summary"],
            tags=data.get("tags", []),
            published=data.get("published", False),
            created_at=data["created_at"],
            updated_at=data["updated_at"],
            author=data.get("author", ""),
        )
