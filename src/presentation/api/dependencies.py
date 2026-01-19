"""FastAPI dependencies for dependency injection."""

from functools import lru_cache
from typing import Generator, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from src.infrastructure.config.settings import get_settings
from src.infrastructure.auth import decode_access_token

security = HTTPBearer()
settings = get_settings()
from src.infrastructure.persistence.mongodb.connection import get_database
from src.infrastructure.persistence.mongodb.article_repository_impl import (
    MongoDBArticleRepository,
)
from src.infrastructure.persistence.mongodb.media_review_repository_impl import (
    MongoDBMediaReviewRepository,
)
from src.application.services.article_service import ArticleService
from src.application.services.portfolio_service import PortfolioService
from src.application.services.chat_service import ChatService
from src.application.services.media_review_service import MediaReviewService
from src.infrastructure.external.tmdb_client import TMDBClient
from src.infrastructure.external.igdb_client import IGDBClient
from src.infrastructure.external.openlibrary_client import OpenLibraryClient


# Singleton instances
_portfolio_service: PortfolioService | None = None
_chat_service: ChatService | None = None
_media_review_service: MediaReviewService | None = None


def get_article_repository() -> MongoDBArticleRepository:
    """Get article repository instance."""
    db = get_database()
    return MongoDBArticleRepository(db["articles"])


def get_article_service() -> ArticleService:
    """Get article service instance."""
    return ArticleService(
        article_repository=get_article_repository(),
    )


def get_portfolio_service() -> PortfolioService:
    """Get or create the portfolio service singleton."""
    global _portfolio_service
    if _portfolio_service is None:
        _portfolio_service = PortfolioService(
            github_token=settings.github_token,
            github_username=settings.github_username,
        )
    return _portfolio_service


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Get the current authenticated user from JWT token."""
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


async def get_current_admin(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Require the current user to be an admin."""
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def get_chat_service() -> ChatService:
    """Get or create the chat service singleton."""
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service


def get_media_review_repository() -> MongoDBMediaReviewRepository:
    """Get media review repository instance."""
    db = get_database()
    return MongoDBMediaReviewRepository(db["media_reviews"])


def get_media_review_service() -> MediaReviewService:
    """Get or create the media review service singleton."""
    global _media_review_service
    if _media_review_service is None:
        # Create external clients if API keys are configured
        tmdb_client = TMDBClient(settings.tmdb_api_key) if settings.tmdb_api_key else None
        igdb_client = (
            IGDBClient(settings.igdb_client_id, settings.igdb_client_secret)
            if settings.igdb_client_id and settings.igdb_client_secret
            else None
        )
        openlibrary_client = OpenLibraryClient()

        _media_review_service = MediaReviewService(
            review_repository=get_media_review_repository(),
            article_repository=get_article_repository(),
            tmdb_client=tmdb_client,
            igdb_client=igdb_client,
            openlibrary_client=openlibrary_client,
        )
    return _media_review_service
