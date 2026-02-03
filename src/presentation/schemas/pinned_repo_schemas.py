"""Schemas for pinned repository endpoints."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, HttpUrl


class PinnedRepoResponse(BaseModel):
    """Response schema for a pinned repository."""

    id: str
    repo_name: str
    display_name: str
    description: Optional[str] = None
    url: HttpUrl
    language: Optional[str] = None
    stars: int
    forks: int
    topics: List[str]
    order: int
    pinned_at: datetime

    class Config:
        from_attributes = True


class AvailableRepoResponse(BaseModel):
    """Response schema for an available GitHub repository."""

    name: str
    description: Optional[str] = None
    url: HttpUrl
    language: Optional[str] = None
    stars: int
    forks: int
    updated_at: str
    topics: List[str]
    is_pinned: bool


class PinRepoRequest(BaseModel):
    """Request schema for pinning a repository."""

    repo_name: str
    display_name: Optional[str] = None


class ReorderReposRequest(BaseModel):
    """Request schema for reordering pinned repositories."""

    repo_ids: List[str]
