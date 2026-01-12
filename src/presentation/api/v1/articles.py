"""Article API endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from src.application.services.article_service import ArticleService
from src.presentation.api.dependencies import get_article_service, get_current_admin
from src.presentation.schemas.article_schemas import (
    ArticleCreate,
    ArticleUpdate,
    ArticleResponse,
    ArticleListResponse,
)

router = APIRouter(prefix="/articles", tags=["articles"])


@router.post(
    "/",
    response_model=ArticleResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_article(
    article: ArticleCreate,
    service: ArticleService = Depends(get_article_service),
    _: dict = Depends(get_current_admin),
):
    """Create a new blog article (admin only)."""
    try:
        created = await service.create_article(article.to_dto())
        return ArticleResponse.from_entity(created)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An article with this title (or slug) already exists. Please use a different title.",
        )


@router.get("/", response_model=ArticleListResponse)
async def list_articles(
    published_only: bool = True,
    limit: int = 100,
    service: ArticleService = Depends(get_article_service),
):
    """List all articles, optionally filtered by publish status."""
    articles = await service.list_articles(
        published_only=published_only,
        limit=limit,
    )
    return ArticleListResponse(
        articles=[ArticleResponse.from_entity(a) for a in articles],
        total=len(articles),
    )


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: UUID,
    service: ArticleService = Depends(get_article_service),
):
    """Get a single article by ID."""
    article = await service.get_article(article_id)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )
    return ArticleResponse.from_entity(article)


@router.get("/slug/{slug}", response_model=ArticleResponse)
async def get_article_by_slug(
    slug: str,
    service: ArticleService = Depends(get_article_service),
):
    """Get a single article by URL slug."""
    article = await service.get_article_by_slug(slug)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )
    return ArticleResponse.from_entity(article)


@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: UUID,
    article: ArticleUpdate,
    service: ArticleService = Depends(get_article_service),
    _: dict = Depends(get_current_admin),
):
    """Update an article (admin only).

    This will trigger automatic embedding regeneration for RAG search.
    """
    try:
        updated = await service.update_article(article_id, article.to_dto())
        return ArticleResponse.from_entity(updated)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: UUID,
    service: ArticleService = Depends(get_article_service),
    _: dict = Depends(get_current_admin),
):
    """Delete an article (admin only)."""
    try:
        await service.delete_article(article_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post("/{article_id}/publish", response_model=ArticleResponse)
async def publish_article(
    article_id: UUID,
    service: ArticleService = Depends(get_article_service),
    _: dict = Depends(get_current_admin),
):
    """Publish an article (admin only)."""
    try:
        updated = await service.publish_article(article_id)
        return ArticleResponse.from_entity(updated)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post("/{article_id}/unpublish", response_model=ArticleResponse)
async def unpublish_article(
    article_id: UUID,
    service: ArticleService = Depends(get_article_service),
    _: dict = Depends(get_current_admin),
):
    """Unpublish an article (admin only)."""
    try:
        updated = await service.unpublish_article(article_id)
        return ArticleResponse.from_entity(updated)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
