"""Pydantic schemas for article endpoints."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from src.domain.entities.article import Article
from src.application.dto.article_dto import CreateArticleDTO, UpdateArticleDTO


class ArticleCreate(BaseModel):
    """Schema for creating a new article."""

    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    summary: str = Field(..., min_length=1, max_length=500)
    tags: List[str] = Field(default_factory=list)
    author: str = Field(default="")

    def to_dto(self) -> CreateArticleDTO:
        """Convert to application DTO."""
        return CreateArticleDTO(
            title=self.title,
            content=self.content,
            summary=self.summary,
            tags=self.tags,
            author=self.author,
        )


class ArticleUpdate(BaseModel):
    """Schema for updating an article."""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    summary: Optional[str] = Field(None, min_length=1, max_length=500)
    tags: Optional[List[str]] = None
    published: Optional[bool] = None

    def to_dto(self) -> UpdateArticleDTO:
        """Convert to application DTO."""
        return UpdateArticleDTO(
            title=self.title,
            content=self.content,
            summary=self.summary,
            tags=self.tags,
            published=self.published,
        )


class ArticleResponse(BaseModel):
    """Schema for article response."""

    id: UUID
    title: str
    slug: str
    content: str
    summary: str
    tags: List[str]
    published: bool
    created_at: datetime
    updated_at: datetime
    author: str

    model_config = {"from_attributes": True}

    @classmethod
    def from_entity(cls, article: Article) -> "ArticleResponse":
        """Create response from domain entity."""
        return cls(
            id=article.id,
            title=article.title,
            slug=article.slug,
            content=article.content,
            summary=article.summary,
            tags=article.tags,
            published=article.published,
            created_at=article.created_at,
            updated_at=article.updated_at,
            author=article.author,
        )


class ArticleListResponse(BaseModel):
    """Schema for list of articles response."""

    articles: List[ArticleResponse]
    total: int
