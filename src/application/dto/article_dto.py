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


@dataclass
class UpdateArticleDTO:
    """DTO for updating an existing article."""

    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None
