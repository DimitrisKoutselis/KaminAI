"""Article DTOs for application layer."""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class CreateArticleDTO:
    """DTO for creating a new article."""

    title: str
    content: str
    summary: str
    tags: List[str]
    author: str = ""
    image_url: Optional[str] = None
    featured: bool = False


@dataclass
class UpdateArticleDTO:
    """DTO for updating an existing article."""

    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None
    featured: Optional[bool] = None
    image_url: Optional[str] = None
