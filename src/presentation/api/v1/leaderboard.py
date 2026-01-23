"""Leaderboard API endpoints."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from src.application.services.article_service import ArticleService
from src.application.services.media_review_service import MediaReviewService
from src.presentation.api.dependencies import (
    get_article_service,
    get_current_admin,
    get_media_review_service,
)
from src.presentation.schemas.leaderboard_schemas import (
    LeaderboardResponse,
    MediaReviewCreate,
    MediaReviewResponse,
    MediaReviewListResponse,
    MediaSearchResponse,
)

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/", response_model=LeaderboardResponse)
async def get_leaderboard(
    service: MediaReviewService = Depends(get_media_review_service),
):
    """Get the full leaderboard with all media types ranked by rating."""
    leaderboard = await service.get_leaderboard()

    return LeaderboardResponse(
        movies=[MediaReviewResponse.from_entity(r) for r in leaderboard["movies"]],
        series=[MediaReviewResponse.from_entity(r) for r in leaderboard["series"]],
        games=[MediaReviewResponse.from_entity(r) for r in leaderboard["games"]],
        books=[MediaReviewResponse.from_entity(r) for r in leaderboard["books"]],
    )


@router.get("/type/{media_type}", response_model=MediaReviewListResponse)
async def get_reviews_by_type(
    media_type: str,
    service: MediaReviewService = Depends(get_media_review_service),
):
    """Get all reviews of a specific media type."""
    valid_types = {"movie", "series", "game", "book"}
    if media_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid media type. Must be one of: {', '.join(valid_types)}",
        )

    reviews = await service.get_all_reviews(media_type=media_type)

    return MediaReviewListResponse(
        reviews=[MediaReviewResponse.from_entity(r) for r in reviews],
        total=len(reviews),
    )


@router.post("/", response_model=MediaReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: MediaReviewCreate,
    article_service: ArticleService = Depends(get_article_service),
    review_service: MediaReviewService = Depends(get_media_review_service),
    _: dict = Depends(get_current_admin),
):
    """Manually create a media review (admin only).

    Optionally link to an existing article by providing article_id.
    """
    article_id = None
    article_slug = None
    article_title = None

    if review_data.article_id:
        article = await article_service.get_article(UUID(review_data.article_id))
        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Linked article not found",
            )
        article_id = article.id
        article_slug = article.slug
        article_title = article.title

    review = await review_service.create_manual_review(
        title=review_data.title,
        media_type=review_data.media_type,
        rating=review_data.rating,
        year=review_data.year,
        article_id=article_id,
        article_slug=article_slug,
        article_title=article_title,
    )

    return MediaReviewResponse.from_entity(review)


@router.post("/extract/{article_id}", response_model=MediaReviewListResponse)
async def extract_reviews(
    article_id: UUID,
    article_service: ArticleService = Depends(get_article_service),
    review_service: MediaReviewService = Depends(get_media_review_service),
    _: dict = Depends(get_current_admin),
):
    """Manually trigger review extraction for an article (admin only).

    This will delete any existing reviews from the article and re-extract.
    """
    article = await article_service.get_article(article_id)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    reviews = await review_service.extract_and_store_reviews(article)

    return MediaReviewListResponse(
        reviews=[MediaReviewResponse.from_entity(r) for r in reviews],
        total=len(reviews),
    )


@router.get("/search", response_model=Optional[MediaSearchResponse])
async def search_media(
    title: str = Query(..., description="Title to search for"),
    media_type: str = Query(..., description="Type of media: movie, series, game, or book"),
    year: Optional[str] = Query(None, description="Optional release year"),
    service: MediaReviewService = Depends(get_media_review_service),
    _: dict = Depends(get_current_admin),
):
    """Search for media in external databases (admin only).

    Used for fetching metadata for the Currently section.
    """
    valid_types = {"movie", "series", "game", "book"}
    if media_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid media type. Must be one of: {', '.join(valid_types)}",
        )

    result = await service.search_media(title, media_type, year)

    if result:
        return MediaSearchResponse(**result)
    return None
